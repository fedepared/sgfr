import type { Customer } from './customer.interface';

export const DELIVERY_STATUSES = [
  'Creado',
  'En Preparación',
  'En camino',
  'Entregado',
  'Fallo en la entrega',
] as const;
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export const TIME_RANGES = ['8:00 a 13:00', '13:00 a 18:00', '18:00 a 23:00'] as const;
export type TimeRange = (typeof TIME_RANGES)[number];

export interface DeliveryAnnotation {
  _id?: string;
  detail: string;
  status?: DeliveryStatus;
  createdAt?: string;
}

export interface Delivery {
  _id: string;
  customer: Customer | string;
  address: string;
  timeRange: TimeRange;
  status: DeliveryStatus;
  distance: number;
  annotations?: DeliveryAnnotation[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDeliveryDTO {
  customer: string;
  address: string;
  timeRange: TimeRange;
  status?: DeliveryStatus;
  distance: number;
}

export interface UpdateDeliveryDTO {
  customer?: string;
  address?: string;
  timeRange?: TimeRange;
  status?: DeliveryStatus;
  distance?: number;
}

export interface UpdateDeliveryStatusDTO {
  status: DeliveryStatus;
  observation?: string;
}

export interface AddDeliveryAnnotationDTO {
  detail: string;
  status?: DeliveryStatus;
}
