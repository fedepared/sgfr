import apiClient from './api.service';
import type {
  CreateCustomerDTO,
  UpdateCustomerDTO,
  PaginatedResponse,
  Customer,
} from '../interfaces';

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const customerService = {
  async getAll(params?: CustomerQueryParams): Promise<PaginatedResponse<Customer>> {
    const response = await apiClient.get<PaginatedResponse<Customer>>('/customers', { params });
    return response.data;
  },

  async getById(id: string): Promise<Customer> {
    const response = await apiClient.get<{ status: string; data: Customer }>(`/customers/${id}`);
    return response.data.data;
  },

  async create(data: CreateCustomerDTO): Promise<Customer> {
    const response = await apiClient.post<{ status: string; data: Customer }>('/customers', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateCustomerDTO): Promise<Customer> {
    const response = await apiClient.put<{ status: string; data: Customer }>(`/customers/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/customers/${id}`);
  },
};
