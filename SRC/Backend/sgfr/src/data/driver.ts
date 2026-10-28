import { Schema, model, InferSchemaType } from 'mongoose';

const driverSchema = new Schema(
  {
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    idCard: { type: Number, default: 0, required: true, unique: true },
    licenseType: { type: Schema.Types.ObjectId, ref: 'LicenseType', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export type Driver = InferSchemaType<typeof driverSchema>;
export const DriverModel = model<Driver>('Driver', driverSchema);
