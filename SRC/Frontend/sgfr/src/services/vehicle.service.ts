import apiClient from './api.service';
import type { CreateVehicleDTO, UpdateVehicleDTO, PaginatedResponse, Vehicle, VehicleStatus } from '../interfaces';

export interface VehicleQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  vehicleType?: string;
}

export const vehicleService = {
  async getAll(params?: VehicleQueryParams): Promise<PaginatedResponse<Vehicle>> {
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

  async update(id: string, data: UpdateVehicleDTO): Promise<Vehicle> {
    const response = await apiClient.put<{ status: string; data: Vehicle }>(`/vehicles/${id}`, data);
    return response.data.data;
  },

  async updateStatus(id: string, status: VehicleStatus): Promise<Vehicle> {
    const response = await apiClient.patch<{ status: string; data: Vehicle }>(`/vehicles/${id}/status`, { status });
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/vehicles/${id}`);
  },
};
