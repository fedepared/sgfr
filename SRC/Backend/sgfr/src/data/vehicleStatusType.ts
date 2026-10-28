import { Schema, model, InferSchemaType } from 'mongoose';

const vehicleStatusTypeSchema = new Schema(
  {
    statusName: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export type VehicleStatusType = InferSchemaType<typeof vehicleStatusTypeSchema>;
export const VehicleStatusTypeModel = model<VehicleStatusType>('VehicleStatusType', vehicleStatusTypeSchema);
