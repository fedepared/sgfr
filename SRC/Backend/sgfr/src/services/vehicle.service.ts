import mongoose from 'mongoose';
import { VehicleModel } from '../data/vehicle';
import { VehicleTypeModel } from '../data/vehicleType';
import { VehicleStatusTypeModel } from '../data/vehicleStatusType';
import { AppError } from '../utils/AppError';
import { getPaginationParams, PaginatedResponse, PaginationQuery } from '../utils/pagination';

export interface VehicleFilterQuery extends PaginationQuery {
  search?: string;
  status?: string;
  vehicleType?: string;
}

export interface CreateVehicleDTO {
  licensePlate: string;
  vehicleType: string;
  capacity: number;
  status: string;
}

export interface UpdateVehicleDTO {
  licensePlate?: string;
  vehicleType?: string;
  capacity?: number;
  status?: string;
}

export class VehicleService {
  async getAll(query: VehicleFilterQuery): Promise<PaginatedResponse<any>> {
    const { page, limit, skip } = getPaginationParams(query);
    const filter: Record<string, any> = {};

    if (query.search && query.search.trim()) {
      filter.licensePlate = { $regex: query.search.trim(), $options: 'i' };
    }

    if (query.status && query.status.trim()) {
      if (mongoose.isValidObjectId(query.status)) {
        filter.status = query.status;
      } else {
        const statusDoc = await VehicleStatusTypeModel.findOne({
          statusName: { $regex: `^${query.status.trim()}$`, $options: 'i' },
        });
        if (statusDoc) {
          filter.status = statusDoc._id;
        } else {
          // Si buscó un estado inexistente, devolvemos lista vacía
          return {
            data: [],
            pagination: {
              totalItems: 0,
              totalPages: 0,
              currentPage: page,
              limit,
            },
          };
        }
      }
    }

    if (query.vehicleType && query.vehicleType.trim()) {
      if (mongoose.isValidObjectId(query.vehicleType)) {
        filter.vehicleType = query.vehicleType;
      } else {
        const typeDoc = await VehicleTypeModel.findOne({
          vehicleTypeName: { $regex: `^${query.vehicleType.trim()}$`, $options: 'i' },
        });
        if (typeDoc) {
          filter.vehicleType = typeDoc._id;
        } else {
          return {
            data: [],
            pagination: {
              totalItems: 0,
              totalPages: 0,
              currentPage: page,
              limit,
            },
          };
        }
      }
    }

    const [totalItems, vehicles] = await Promise.all([
      VehicleModel.countDocuments(filter),
      VehicleModel.find(filter)
        .populate('vehicleType', 'vehicleTypeName')
        .populate('status', 'statusName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: vehicles,
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
      throw new AppError('Identificador de vehículo inválido.', 400);
    }

    const vehicle = await VehicleModel.findById(id)
      .populate('vehicleType', 'vehicleTypeName')
      .populate('status', 'statusName');

    if (!vehicle) {
      throw new AppError('Vehículo no encontrado.', 404);
    }

    return vehicle;
  }

  async create(data: CreateVehicleDTO) {
    const { licensePlate, vehicleType, capacity, status } = data;

    if (!licensePlate || !licensePlate.trim()) {
      throw new AppError('La patente del vehículo es obligatoria.', 400);
    }

    const cleanPlate = licensePlate.trim().toUpperCase();

    const existingVehicle = await VehicleModel.findOne({ licensePlate: cleanPlate });
    if (existingVehicle) {
      throw new AppError(`Ya existe un vehículo registrado con la patente "${cleanPlate}".`, 409);
    }

    if (capacity === undefined || capacity === null || isNaN(Number(capacity)) || Number(capacity) < 0) {
      throw new AppError('La capacidad de carga debe ser un número mayor o igual a 0.', 400);
    }

    if (!mongoose.isValidObjectId(vehicleType)) {
      throw new AppError('Identificador de tipo de vehículo inválido.', 400);
    }

    const typeExists = await VehicleTypeModel.findById(vehicleType);
    if (!typeExists) {
      throw new AppError('El tipo de vehículo especificado no existe.', 404);
    }

    if (!mongoose.isValidObjectId(status)) {
      throw new AppError('Identificador de estado de vehículo inválido.', 400);
    }

    const statusExists = await VehicleStatusTypeModel.findById(status);
    if (!statusExists) {
      throw new AppError('El estado de vehículo especificado no existe.', 404);
    }

    const newVehicle = await VehicleModel.create({
      licensePlate: cleanPlate,
      vehicleType,
      capacity: Number(capacity),
      status,
    });

    return await VehicleModel.findById(newVehicle._id)
      .populate('vehicleType', 'vehicleTypeName')
      .populate('status', 'statusName');
  }

  async update(id: string, data: UpdateVehicleDTO) {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Identificador de vehículo inválido.', 400);
    }

    const vehicle = await VehicleModel.findById(id);
    if (!vehicle) {
      throw new AppError('Vehículo no encontrado.', 404);
    }

    const updateFields: Record<string, any> = {};

    if (data.licensePlate !== undefined) {
      if (!data.licensePlate.trim()) {
        throw new AppError('La patente no puede estar vacía.', 400);
      }
      const cleanPlate = data.licensePlate.trim().toUpperCase();
      const duplicate = await VehicleModel.findOne({
        licensePlate: cleanPlate,
        _id: { $ne: id },
      });
      if (duplicate) {
        throw new AppError(`La patente "${cleanPlate}" ya está en uso por otro vehículo.`, 409);
      }
      updateFields.licensePlate = cleanPlate;
    }

    if (data.capacity !== undefined) {
      if (isNaN(Number(data.capacity)) || Number(data.capacity) < 0) {
        throw new AppError('La capacidad debe ser un número mayor o igual a 0.', 400);
      }
      updateFields.capacity = Number(data.capacity);
    }

    if (data.vehicleType !== undefined) {
      if (!mongoose.isValidObjectId(data.vehicleType)) {
        throw new AppError('Identificador de tipo de vehículo inválido.', 400);
      }
      const typeExists = await VehicleTypeModel.findById(data.vehicleType);
      if (!typeExists) {
        throw new AppError('El tipo de vehículo especificado no existe.', 404);
      }
      updateFields.vehicleType = data.vehicleType;
    }

    if (data.status !== undefined) {
      if (!mongoose.isValidObjectId(data.status)) {
        throw new AppError('Identificador de estado de vehículo inválido.', 400);
      }
      const statusExists = await VehicleStatusTypeModel.findById(data.status);
      if (!statusExists) {
        throw new AppError('El estado de vehículo especificado no existe.', 404);
      }
      updateFields.status = data.status;
    }

    const updatedVehicle = await VehicleModel.findByIdAndUpdate(id, { $set: updateFields }, { new: true })
      .populate('vehicleType', 'vehicleTypeName')
      .populate('status', 'statusName');

    return updatedVehicle;
  }

  async updateStatus(id: string, statusId: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Identificador de vehículo inválido.', 400);
    }

    if (!statusId || !mongoose.isValidObjectId(statusId)) {
      throw new AppError('Identificador de nuevo estado inválido.', 400);
    }

    const statusExists = await VehicleStatusTypeModel.findById(statusId);
    if (!statusExists) {
      throw new AppError('El estado de vehículo especificado no existe.', 404);
    }

    const vehicle = await VehicleModel.findByIdAndUpdate(
      id,
      { $set: { status: statusId } },
      { new: true }
    )
      .populate('vehicleType', 'vehicleTypeName')
      .populate('status', 'statusName');

    if (!vehicle) {
      throw new AppError('Vehículo no encontrado.', 404);
    }

    return vehicle;
  }

  async delete(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Identificador de vehículo inválido.', 400);
    }

    const vehicle = await VehicleModel.findByIdAndDelete(id);
    if (!vehicle) {
      throw new AppError('Vehículo no encontrado.', 404);
    }

    return {
      message: 'Vehículo eliminado con éxito.',
      id,
    };
  }
}

export const vehicleService = new VehicleService();
