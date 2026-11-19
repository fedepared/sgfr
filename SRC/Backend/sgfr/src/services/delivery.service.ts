import mongoose from 'mongoose';
import { DeliveryModel, Delivery } from '../data/delivery';
import { CustomerModel } from '../data/customer';
import { AppError } from '../utils/AppError';
import { getPaginationParams, PaginatedResponse } from '../utils/pagination';
import {
  CreateDeliveryDTO,
  UpdateDeliveryDTO,
  DeliveryFilterQuery,
  UpdateDeliveryStatusDTO,
  AddDeliveryAnnotationDTO,
  DELIVERY_STATUSES,
  TIME_RANGES,
  DeliveryStatusEnum,
  TimeRangeEnum,
} from '../utils/DTOs/Delivery';

const isDeliveryStatus = (status: string): status is DeliveryStatusEnum => {
  return DELIVERY_STATUSES.includes(status as DeliveryStatusEnum);
};

const isTimeRange = (range: string): range is TimeRangeEnum => {
  return TIME_RANGES.includes(range as TimeRangeEnum);
};

export class DeliveryService {
  async getAll(query: DeliveryFilterQuery): Promise<PaginatedResponse<any>> {
    const { page, limit, skip } = getPaginationParams(query);
    const filter: Record<string, any> = {};

    if (query.status && query.status.trim()) {
      if (isDeliveryStatus(query.status.trim())) {
        filter.status = query.status.trim();
      }
    }

    if (query.customer && mongoose.isValidObjectId(query.customer)) {
      filter.customer = query.customer;
    }

    if (query.timeRange && isTimeRange(query.timeRange)) {
      filter.timeRange = query.timeRange;
    }

    const [totalItems, deliveries] = await Promise.all([
      DeliveryModel.countDocuments(filter),
      DeliveryModel.find(filter)
        .populate('customer')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: deliveries,
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
      throw new AppError('Identificador de entrega inválido.', 400);
    }

    const delivery = await DeliveryModel.findById(id).populate('customer');
    if (!delivery) {
      throw new AppError('Entrega no encontrada.', 404);
    }

    return delivery;
  }

  async create(data: CreateDeliveryDTO) {
    const { customer, address, timeRange, distance, status, annotations } = data;

    if (!customer || !mongoose.isValidObjectId(customer)) {
      throw new AppError('Identificador de cliente inválido.', 400);
    }

    const customerExists = await CustomerModel.findById(customer);
    if (!customerExists) {
      throw new AppError('El cliente especificado no existe.', 404);
    }

    if (!address || !address.trim()) {
      throw new AppError('La dirección de entrega es obligatoria.', 400);
    }

    if (!timeRange || !isTimeRange(timeRange)) {
      throw new AppError(
        `Franja horaria inválida. Valores aceptados: ${TIME_RANGES.join(', ')}`,
        400
      );
    }

    if (distance === undefined || isNaN(Number(distance)) || Number(distance) < 0) {
      throw new AppError('La distancia estimada debe ser un número mayor o igual a 0.', 400);
    }

    const initialStatus: DeliveryStatusEnum = status && isDeliveryStatus(status) ? status : 'Creado';

    const cleanAnnotations = (annotations || []).map((ann) => ({
      detail: ann.detail.trim(),
      status: ann.status && isDeliveryStatus(ann.status) ? ann.status : initialStatus,
    }));

    const newDelivery = await DeliveryModel.create({
      customer,
      address: address.trim(),
      timeRange,
      status: initialStatus,
      distance: Number(distance),
      annotations: cleanAnnotations,
    });

    return await DeliveryModel.findById(newDelivery._id).populate('customer');
  }

  async update(id: string, data: UpdateDeliveryDTO) {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Identificador de entrega inválido.', 400);
    }

    const delivery = await DeliveryModel.findById(id);
    if (!delivery) {
      throw new AppError('Entrega no encontrada.', 404);
    }

    const updateFields: Record<string, any> = {};

    if (data.customer !== undefined) {
      if (!mongoose.isValidObjectId(data.customer)) {
        throw new AppError('Identificador de cliente inválido.', 400);
      }
      const customerExists = await CustomerModel.findById(data.customer);
      if (!customerExists) throw new AppError('El cliente no existe.', 404);
      updateFields.customer = data.customer;
    }

    if (data.address !== undefined) {
      if (!data.address.trim()) throw new AppError('La dirección no puede estar vacía.', 400);
      updateFields.address = data.address.trim();
    }

    if (data.timeRange !== undefined) {
      if (!isTimeRange(data.timeRange)) {
        throw new AppError(
          `Franja horaria inválida. Valores aceptados: ${TIME_RANGES.join(', ')}`,
          400
        );
      }
      updateFields.timeRange = data.timeRange;
    }

    if (data.status !== undefined) {
      if (!isDeliveryStatus(data.status)) {
        throw new AppError(
          `Estado inválido. Valores aceptados: ${DELIVERY_STATUSES.join(', ')}`,
          400
        );
      }
      updateFields.status = data.status;
    }

    if (data.distance !== undefined) {
      if (isNaN(Number(data.distance)) || Number(data.distance) < 0) {
        throw new AppError('La distancia debe ser mayor o igual a 0.', 400);
      }
      updateFields.distance = Number(data.distance);
    }

    const updated = await DeliveryModel.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    ).populate('customer');

    return updated;
  }

  async updateStatus(id: string, data: UpdateDeliveryStatusDTO) {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Identificador de entrega inválido.', 400);
    }

    if (!data.status || !isDeliveryStatus(data.status)) {
      throw new AppError(
        `Estado inválido. Valores aceptados: ${DELIVERY_STATUSES.join(', ')}`,
        400
      );
    }

    const delivery = await DeliveryModel.findById(id);
    if (!delivery) {
      throw new AppError('Entrega no encontrada.', 404);
    }

    delivery.status = data.status;

    if (data.observation && data.observation.trim()) {
      delivery.annotations.push({
        detail: data.observation.trim(),
        status: data.status,
      } as any);
    }

    await delivery.save();
    return await DeliveryModel.findById(id).populate('customer');
  }

  async addAnnotation(id: string, data: AddDeliveryAnnotationDTO) {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Identificador de entrega inválido.', 400);
    }

    if (!data.detail || !data.detail.trim()) {
      throw new AppError('El detalle de la observación es obligatorio.', 400);
    }

    const delivery = await DeliveryModel.findById(id);
    if (!delivery) {
      throw new AppError('Entrega no encontrada.', 404);
    }

    const annotationStatus = data.status && isDeliveryStatus(data.status) ? data.status : delivery.status;

    delivery.annotations.push({
      detail: data.detail.trim(),
      status: annotationStatus,
    } as any);

    await delivery.save();
    return delivery;
  }

  async delete(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Identificador de entrega inválido.', 400);
    }

    const delivery = await DeliveryModel.findByIdAndDelete(id);
    if (!delivery) {
      throw new AppError('Entrega no encontrada.', 404);
    }

    return {
      message: 'Entrega eliminada con éxito.',
      id,
    };
  }
}

export const deliveryService = new DeliveryService();
