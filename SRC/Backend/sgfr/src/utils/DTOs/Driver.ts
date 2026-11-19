import { PaginationQuery } from '../pagination';

export interface DriverFilterQuery extends PaginationQuery {
  search?: string;
  licenseType?: string;
}

export interface CreateDriverDTO {
  name: string;
  lastName: string;
  idCard: number;
  licenseType: string;
  user?: string; // ID de un User existente opcional
  createAccount?: {
    userName: string;
    password: string;
  };
}

export interface UpdateDriverDTO {
  name?: string;
  lastName?: string;
  idCard?: number;
  licenseType?: string;
  user?: string | null;
}
