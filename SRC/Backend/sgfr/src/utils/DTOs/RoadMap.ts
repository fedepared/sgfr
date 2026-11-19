import { PaginationQuery } from '../pagination';

export interface CreateRoadMapDTO {
  date: string | Date;
  vehicle: string;
  driver: string;
  deliveries?: string[]; // IDs de entregas existentes
}

export interface UpdateRoadMapDTO {
  date?: string | Date;
  vehicle?: string;
  driver?: string;
  deliveries?: string[];
}

export interface RoadMapFilterQuery extends PaginationQuery {
  startDate?: string;
  endDate?: string;
  vehicle?: string;
  driver?: string;
}

export interface AddDeliveryToRoadMapDTO {
  deliveryId: string;
}
