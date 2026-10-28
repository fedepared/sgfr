import apiClient from './api.service';
import type { CreateVehicleDTO, PaginatedResponse, Vehicle } from '../interfaces';

export const vehicleService = {
  async getAll(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Vehicle>> {
    const response = await apiClient.get<PaginatedResponse<Vehicle>>('/vehicles', { params });
    return response.data;
  },

  async getById(id: string): Promise<Vehicle> {
    const response = await apiClient.get<{ status: string; data: Vehicle }>(`/vehicles/${id}`);
    return response.data.data;
  },

  async create(data: CreateVehicleDTO): Promise<Vehicle> {
    const response = await apiClient.post<{ status: string; data: Vehicle }>('/vehicles', data);
    return response.data.data;
  },

  async update(id: string, data: Partial<CreateVehicleDTO>): Promise<Vehicle> {
    const response = await apiClient.put<{ status: string; data: Vehicle }>(`/vehicles/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/vehicles/${id}`);
  },
};
