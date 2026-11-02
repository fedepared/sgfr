import { PaginationQuery } from "../pagination";


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

