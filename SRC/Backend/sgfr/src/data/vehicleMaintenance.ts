import { Schema, model, InferSchemaType } from 'mongoose';

const vehicleMaintenanceSchema = new Schema(
  {
    vehicleMaintenanceType: { type: Schema.Types.ObjectId, ref: 'VehicleMaintenanceType', required: true },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    price: { type: Number, required: true },
    date: { type: Date, default: Date.now, required: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

export type VehicleMaintenance = InferSchemaType<typeof vehicleMaintenanceSchema>;
export const VehicleMaintenanceModel = model<VehicleMaintenance>('VehicleMaintenance', vehicleMaintenanceSchema);
