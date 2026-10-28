import { Schema, model, InferSchemaType } from 'mongoose';

const vehicleTypeSchema = new Schema(
  {
    vehicleTypeName: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export type VehicleType = InferSchemaType<typeof vehicleTypeSchema>;
export const VehicleTypeModel = model<VehicleType>('VehicleType', vehicleTypeSchema);
