import { PaginationQuery } from "../pagination";


export interface VehicleTypeFilterQuery extends PaginationQuery {
  search?: string;
  status?: string;
  vehicleType?: string;
}


