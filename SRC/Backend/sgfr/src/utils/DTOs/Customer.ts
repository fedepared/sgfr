import { PaginationQuery } from '../pagination';

export interface CustomerAddressDTO {
  street: string;
  zipCode?: string;
  floor?: number;
  dept?: string;
}

export interface CustomerFilterQuery extends PaginationQuery {
  search?: string;
}

export interface CreateCustomerDTO {
  name: string;
  lastName: string;
  idCard: number;
  addresses: CustomerAddressDTO[];
}

export interface UpdateCustomerDTO {
  name?: string;
  lastName?: string;
  idCard?: number;
  addresses?: CustomerAddressDTO[];
}
