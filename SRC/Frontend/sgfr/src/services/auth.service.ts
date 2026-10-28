import apiClient from './api.service';
import type { ApiResponse, AuthResponse, LoginCredentials, User } from '../interfaces';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error('Respuesta de autenticación inválida');
  },

  async register(userData: LoginCredentials & { roleName?: string }): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error('Error al registrar usuario');
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error('No se pudo obtener el perfil de usuario');
  },
};
