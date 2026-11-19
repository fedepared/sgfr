import { PaginationQuery } from '../pagination';

export const DELIVERY_STATUSES = [
  'Creado',
  'En Preparación',
  'En camino',
  'Entregado',
  'Fallo en la entrega',
] as const;

export type DeliveryStatusEnum = (typeof DELIVERY_STATUSES)[number];

export const TIME_RANGES = ['8:00 a 13:00', '13:00 a 18:00', '18:00 a 23:00'] as const;
export type TimeRangeEnum = (typeof TIME_RANGES)[number];

export interface DeliveryAnnotationDTO {
  detail: string;
  status?: DeliveryStatusEnum;
}

export interface DeliveryFilterQuery extends PaginationQuery {
  search?: string;
  status?: string;
  customer?: string;
  timeRange?: string;
}

export interface CreateDeliveryDTO {
  customer: string;
  address: string;
  timeRange: TimeRangeEnum;
  status?: DeliveryStatusEnum;
  distance: number;
  annotations?: DeliveryAnnotationDTO[];
}

export interface UpdateDeliveryDTO {
  customer?: string;
  address?: string;
  timeRange?: TimeRangeEnum;
  status?: DeliveryStatusEnum;
  distance?: number;
}

export interface UpdateDeliveryStatusDTO {
  status: DeliveryStatusEnum;
  observation?: string;
}

export interface AddDeliveryAnnotationDTO {
  detail: string;
  status?: DeliveryStatusEnum;
}
