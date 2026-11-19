export interface CustomerAddress {
  _id?: string;
  street: string;
  zipCode?: string;
  floor?: number;
  dept?: string;
}

export interface Customer {
  _id: string;
  name: string;
  lastName: string;
  idCard: number;
  addresses: CustomerAddress[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCustomerDTO {
  name: string;
  lastName: string;
  idCard: number;
  addresses: CustomerAddress[];
}

export interface UpdateCustomerDTO {
  name?: string;
  lastName?: string;
  idCard?: number;
  addresses?: CustomerAddress[];
}
