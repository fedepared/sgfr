export interface VehicleTypeInfo {
  _id: string;
  vehicleTypeName: string;
}

export interface VehicleStatusInfo {
  _id: string;
  vehicleStatusName: string;
}

export interface Vehicle {
  _id: string;
  licensePlate: string;
  capacity: number;
  vehicleType: VehicleTypeInfo | string;
  status: VehicleStatusInfo | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVehicleDTO {
  licensePlate: string;
  capacity: number;
  vehicleTypeId: string;
  statusId?: string;
}
