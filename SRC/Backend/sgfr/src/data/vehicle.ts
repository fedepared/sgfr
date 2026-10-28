import { Schema, model, InferSchemaType } from 'mongoose';

const vehicleSchema = new Schema(
  {
    licensePlate: { type: String, required: true, unique: true },
    vehicleType: { type: Schema.Types.ObjectId, ref: 'VehicleType', required: true },
    capacity: { type: Number, default: 0, required: true },
    status: { type: Schema.Types.ObjectId, ref: 'VehicleStatusType', required: true },
  },
  { timestamps: true }
);

export type Vehicle = InferSchemaType<typeof vehicleSchema>;
export const VehicleModel = model<Vehicle>('Vehicle', vehicleSchema);
