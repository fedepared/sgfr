import mongoose from 'mongoose';
import { VehicleModel } from '../data/vehicle';
import { AppError } from '../utils/AppError';
import { getPaginationParams, PaginatedResponse, PaginationQuery } from '../utils/pagination';
import { VehicleFilterQuery, CreateVehicleDTO, UpdateVehicleDTO } from '../utils/DTOs/Vehicle';

const VEHICLE_STATUSES = ['Disponible', 'En ruta', 'En mantenimiento', 'Fuera de servicio'] as const;
type VehicleStatus = (typeof VEHICLE_STATUSES)[number];

const isVehicleStatus = (status: string): status is VehicleStatus => {
  return VEHICLE_STATUSES.includes(status as VehicleStatus);
};

export class VehicleService {
  async getAll(query: VehicleFilterQuery): Promise<PaginatedResponse<any>> {
    const { page, limit, skip } = getPaginationParams(query);
    const filter: Record<string, any> = {};

    if (query.search && query.search.trim()) {
      filter.licensePlate = { $regex: query.search.trim(), $options: 'i' };
    }

    if (query.status && query.status.trim()) {
      const requestedStatus = query.status.trim();
      const matchingStatus = VEHICLE_STATUSES.find(
        (vehicleStatus) => vehicleStatus.toLowerCase() === requestedStatus.toLowerCase()
      );

      if (!matchingStatus) {
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

      filter.status = matchingStatus;
    }

    if (query.vehicleType && query.vehicleType.trim()) {
      if (!mongoose.isValidObjectId(query.vehicleType)) {
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

      filter.vehicleType = query.vehicleType;
    }

    const [totalItems, vehicles] = await Promise.all([
      VehicleModel.countDocuments(filter),
      VehicleModel.find(filter)
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

    const vehicle = await VehicleModel.findById(id);

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

    if (!isVehicleStatus(status)) {
      throw new AppError('El estado de vehículo especificado no es válido.', 400);
    }

    const newVehicle = await VehicleModel.create({
      licensePlate: cleanPlate,
      vehicleType,
      capacity: Number(capacity),
      status,
    });

    return await VehicleModel.findById(newVehicle._id);
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
      updateFields.vehicleType = data.vehicleType;
    }

    if (data.status !== undefined) {
      if (!isVehicleStatus(data.status)) {
        throw new AppError('El estado de vehículo especificado no es válido.', 400);
      }
      updateFields.status = data.status;
    }

    const updatedVehicle = await VehicleModel.findByIdAndUpdate(id, { $set: updateFields }, { new: true });

    return updatedVehicle;
  }

  async updateStatus(id: string, status: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Identificador de vehículo inválido.', 400);
    }

    if (!isVehicleStatus(status)) {
      throw new AppError('El estado de vehículo especificado no es válido.', 400);
    }

    const vehicle = await VehicleModel.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );

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
