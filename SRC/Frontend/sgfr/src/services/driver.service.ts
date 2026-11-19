import apiClient from './api.service';
import type {
  CreateDriverDTO,
  UpdateDriverDTO,
  PaginatedResponse,
  Driver,
  LicenseType,
} from '../interfaces';

export interface DriverQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  licenseType?: string;
}

export const driverService = {
  async getAll(params?: DriverQueryParams): Promise<PaginatedResponse<Driver>> {
    const response = await apiClient.get<PaginatedResponse<Driver>>('/drivers', { params });
    return response.data;
  },

  async getById(id: string): Promise<Driver> {
    const response = await apiClient.get<{ status: string; data: Driver }>(`/drivers/${id}`);
    return response.data.data;
  },

  async getLicenseTypes(): Promise<LicenseType[]> {
    const response = await apiClient.get<{ status: string; data: LicenseType[] }>('/drivers/license-types');
    return response.data.data;
  },

  async create(data: CreateDriverDTO): Promise<Driver> {
    const response = await apiClient.post<{ status: string; data: Driver }>('/drivers', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateDriverDTO): Promise<Driver> {
    const response = await apiClient.put<{ status: string; data: Driver }>(`/drivers/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/drivers/${id}`);
  },
};
