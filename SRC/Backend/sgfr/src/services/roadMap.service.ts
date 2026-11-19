import mongoose from 'mongoose';
import { RoadMapModel } from '../data/roadMap';
import { DriverModel } from '../data/driver';
import { VehicleModel } from '../data/vehicle';
import { DeliveryModel } from '../data/delivery';
import { AppError } from '../utils/AppError';
import { getPaginationParams, PaginatedResponse } from '../utils/pagination';
import {
  CreateRoadMapDTO,
  UpdateRoadMapDTO,
  RoadMapFilterQuery,
} from '../utils/DTOs/RoadMap';

export class RoadMapService {
  async getAll(query: RoadMapFilterQuery): Promise<PaginatedResponse<any>> {
    const { page, limit, skip } = getPaginationParams(query);
    const filter: Record<string, any> = {};

    if (query.vehicle && mongoose.isValidObjectId(query.vehicle)) {
      filter.vehicle = query.vehicle;
    }

    if (query.driver && mongoose.isValidObjectId(query.driver)) {
      filter.driver = query.driver;
    }

    if (query.startDate || query.endDate) {
      filter.date = {};
      if (query.startDate) {
        const start = new Date(query.startDate);
        if (!isNaN(start.getTime())) {
          start.setHours(0, 0, 0, 0);
          filter.date.$gte = start;
        }
      }
      if (query.endDate) {
        const end = new Date(query.endDate);
        if (!isNaN(end.getTime())) {
          end.setHours(23, 59, 59, 999);
          filter.date.$lte = end;
        }
      }
    }

    const [totalItems, roadMaps] = await Promise.all([
      RoadMapModel.countDocuments(filter),
      RoadMapModel.find(filter)
        .populate('vehicle')
        .populate({
          path: 'driver',
          populate: { path: 'licenseType' },
        })
        .populate({
          path: 'deliveries',
          populate: { path: 'customer' },
        })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: roadMaps,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  }

  async getById(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Identificador de hoja de ruta inválido.', 400);
    }

    const roadMap = await RoadMapModel.findById(id)
      .populate('vehicle')
      .populate({
        path: 'driver',
        populate: { path: 'licenseType' },
      })
      .populate({
        path: 'deliveries',
        populate: { path: 'customer' },
      });

    if (!roadMap) {
      throw new AppError('Hoja de ruta no encontrada.', 404);
    }

    return roadMap;
  }

  async getTodayRoadMapForDriver(userId: string) {
    const driver = await DriverModel.findOne({ user: userId });
    if (!driver) {
      throw new AppError('No se encontró un perfil de chofer vinculado a este usuario.', 404);
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const roadMap = await RoadMapModel.findOne({
      driver: driver._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate('vehicle')
      .populate({
        path: 'driver',
        populate: { path: 'licenseType' },
      })
      .populate({
        path: 'deliveries',
        populate: { path: 'customer' },
      });

    if (!roadMap) {
      throw new AppError('No tienes una hoja de ruta asignada para el día de hoy.', 404);
    }

    return roadMap;
  }

  async create(data: CreateRoadMapDTO) {
    const { date, vehicle, driver, deliveries } = data;

    if (!date) {
      throw new AppError('La fecha de la hoja de ruta es obligatoria.', 400);
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new AppError('Fecha inválida.', 400);
    }

    if (!vehicle || !mongoose.isValidObjectId(vehicle)) {
      throw new AppError('Identificador de vehículo inválido.', 400);
    }
    const vehicleDoc = await VehicleModel.findById(vehicle);
    if (!vehicleDoc) {
      throw new AppError('El vehículo especificado no existe.', 404);
    }

    if (!driver || !mongoose.isValidObjectId(driver)) {
      throw new AppError('Identificador de chofer inválido.', 400);
    }
    const driverDoc = await DriverModel.findById(driver);
    if (!driverDoc) {
      throw new AppError('El chofer especificado no existe.', 404);
    }

    // Validar IDs de entregas provistos
    const deliveryIds = await this.validateDeliveryIds(deliveries || []);

    const newRoadMap = await RoadMapModel.create({
      date: parsedDate,
      vehicle,
      driver,
      deliveries: deliveryIds,
    });

    return await RoadMapModel.findById(newRoadMap._id)
      .populate('vehicle')
      .populate({
        path: 'driver',
        populate: { path: 'licenseType' },
      })
      .populate({
        path: 'deliveries',
        populate: { path: 'customer' },
      });
  }

  async update(id: string, data: UpdateRoadMapDTO) {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Identificador de hoja de ruta inválido.', 400);
    }

    const roadMap = await RoadMapModel.findById(id);
    if (!roadMap) {
      throw new AppError('Hoja de ruta no encontrada.', 404);
    }

    const updateFields: Record<string, any> = {};

    if (data.date !== undefined) {
      const parsedDate = new Date(data.date);
      if (isNaN(parsedDate.getTime())) throw new AppError('Fecha inválida.', 400);
      updateFields.date = parsedDate;
    }

    if (data.vehicle !== undefined) {
      if (!mongoose.isValidObjectId(data.vehicle)) {
        throw new AppError('Identificador de vehículo inválido.', 400);
      }
      const vehicleExists = await VehicleModel.findById(data.vehicle);
      if (!vehicleExists) throw new AppError('El vehículo no existe.', 404);
      updateFields.vehicle = data.vehicle;
    }

    if (data.driver !== undefined) {
      if (!mongoose.isValidObjectId(data.driver)) {
        throw new AppError('Identificador de chofer inválido.', 400);
      }
      const driverExists = await DriverModel.findById(data.driver);
      if (!driverExists) throw new AppError('El chofer no existe.', 404);
      updateFields.driver = data.driver;
    }

    if (data.deliveries !== undefined) {
      updateFields.deliveries = await this.validateDeliveryIds(data.deliveries);
    }

    const updated = await RoadMapModel.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    )
      .populate('vehicle')
      .populate({
        path: 'driver',
        populate: { path: 'licenseType' },
      })
      .populate({
        path: 'deliveries',
        populate: { path: 'customer' },
      });

    return updated;
  }

  async addDelivery(roadMapId: string, deliveryId: string) {
    if (!mongoose.isValidObjectId(roadMapId)) {
      throw new AppError('Identificador de hoja de ruta inválido.', 400);
    }
    if (!mongoose.isValidObjectId(deliveryId)) {
      throw new AppError('Identificador de entrega inválido.', 400);
    }

    const [roadMap, delivery] = await Promise.all([
      RoadMapModel.findById(roadMapId),
      DeliveryModel.findById(deliveryId),
    ]);

    if (!roadMap) throw new AppError('Hoja de ruta no encontrada.', 404);
    if (!delivery) throw new AppError('Entrega no encontrada.', 404);

    const alreadyInRoadMap = roadMap.deliveries.some(
      (dId) => dId.toString() === deliveryId
    );

    if (!alreadyInRoadMap) {
      roadMap.deliveries.push(delivery._id as any);
      await roadMap.save();
    }

    return await RoadMapModel.findById(roadMapId)
      .populate('vehicle')
      .populate({
        path: 'driver',
        populate: { path: 'licenseType' },
      })
      .populate({
        path: 'deliveries',
        populate: { path: 'customer' },
      });
  }

  async removeDelivery(roadMapId: string, deliveryId: string) {
    if (!mongoose.isValidObjectId(roadMapId)) {
      throw new AppError('Identificador de hoja de ruta inválido.', 400);
    }
    if (!mongoose.isValidObjectId(deliveryId)) {
      throw new AppError('Identificador de entrega inválido.', 400);
    }

    const roadMap = await RoadMapModel.findById(roadMapId);
    if (!roadMap) throw new AppError('Hoja de ruta no encontrada.', 404);

    roadMap.deliveries = roadMap.deliveries.filter(
      (dId) => dId.toString() !== deliveryId
    ) as any;

    await roadMap.save();

    return await RoadMapModel.findById(roadMapId)
      .populate('vehicle')
      .populate({
        path: 'driver',
        populate: { path: 'licenseType' },
      })
      .populate({
        path: 'deliveries',
        populate: { path: 'customer' },
      });
  }

  async delete(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Identificador de hoja de ruta inválido.', 400);
    }

    const roadMap = await RoadMapModel.findByIdAndDelete(id);
    if (!roadMap) {
      throw new AppError('Hoja de ruta no encontrada.', 404);
    }

    return {
      message: 'Hoja de ruta eliminada con éxito.',
      id,
    };
  }

  private async validateDeliveryIds(deliveryIds: string[]) {
    const validObjectIds: mongoose.Types.ObjectId[] = [];

    for (let i = 0; i < deliveryIds.length; i++) {
      const dId = deliveryIds[i];
      if (!mongoose.isValidObjectId(dId)) {
        throw new AppError(`Identificador de entrega inválido en posición #${i + 1}.`, 400);
      }

      const deliveryExists = await DeliveryModel.findById(dId);
      if (!deliveryExists) {
        throw new AppError(`La entrega con ID ${dId} no existe.`, 404);
      }

      validObjectIds.push(new mongoose.Types.ObjectId(dId));
    }

    return validObjectIds;
  }
}

export const roadMapService = new RoadMapService();
