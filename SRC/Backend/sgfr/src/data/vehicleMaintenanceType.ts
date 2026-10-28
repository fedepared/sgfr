import { Schema, model, InferSchemaType } from 'mongoose';

const vehicleMaintenanceTypeSchema = new Schema(
  {
    description: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export type VehicleMaintenanceType = InferSchemaType<typeof vehicleMaintenanceTypeSchema>;
export const VehicleMaintenanceTypeModel = model<VehicleMaintenanceType>(
  'VehicleMaintenanceType',
  vehicleMaintenanceTypeSchema
);
