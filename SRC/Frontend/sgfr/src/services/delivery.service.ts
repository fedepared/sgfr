import apiClient from './api.service';
import type {
  CreateDeliveryDTO,
  UpdateDeliveryDTO,
  UpdateDeliveryStatusDTO,
  AddDeliveryAnnotationDTO,
  PaginatedResponse,
  Delivery,
} from '../interfaces';

export interface DeliveryQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  customer?: string;
  timeRange?: string;
}

export const deliveryService = {
  async getAll(params?: DeliveryQueryParams): Promise<PaginatedResponse<Delivery>> {
    const response = await apiClient.get<PaginatedResponse<Delivery>>('/deliveries', { params });
    return response.data;
  },

  async getById(id: string): Promise<Delivery> {
    const response = await apiClient.get<{ status: string; data: Delivery }>(`/deliveries/${id}`);
    return response.data.data;
  },

  async create(data: CreateDeliveryDTO): Promise<Delivery> {
    const response = await apiClient.post<{ status: string; data: Delivery }>('/deliveries', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateDeliveryDTO): Promise<Delivery> {
    const response = await apiClient.put<{ status: string; data: Delivery }>(`/deliveries/${id}`, data);
    return response.data.data;
  },

  async updateStatus(id: string, data: UpdateDeliveryStatusDTO): Promise<Delivery> {
    const response = await apiClient.patch<{ status: string; data: Delivery }>(`/deliveries/${id}/status`, data);
    return response.data.data;
  },

  async addAnnotation(id: string, data: AddDeliveryAnnotationDTO): Promise<Delivery> {
    const response = await apiClient.post<{ status: string; data: Delivery }>(`/deliveries/${id}/annotations`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/deliveries/${id}`);
  },
};
