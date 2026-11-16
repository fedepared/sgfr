export const VEHICLE_TYPES = ['Auto', 'Camion', 'Moto', 'Furgon', 'Utilitario'] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const VEHICLE_STATUSES = ['Disponible', 'En ruta', 'En mantenimiento', 'Fuera de servicio'] as const;
export type VehicleStatus = (typeof VEHICLE_STATUSES)[number];

export interface Vehicle {
  _id: string;
  licensePlate: string;
  capacity: number;
  vehicleType: VehicleType;
  status: VehicleStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVehicleDTO {
  licensePlate: string;
  vehicleType: VehicleType;
  capacity: number;
  status: VehicleStatus;
}

export interface UpdateVehicleDTO {
  licensePlate?: string;
  vehicleType?: VehicleType;
  capacity?: number;
  status?: VehicleStatus;
}
