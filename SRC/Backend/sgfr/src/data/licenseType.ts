import { Schema, model, InferSchemaType } from 'mongoose';

const licenseTypeSchema = new Schema(
  {
    licenseTypeLetter: { type: String, required: true, minLength: 1, maxLength: 1 },
    licenseTypeNumber: { type: Number, required: true, min: 1, max: 4 },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

export type LicenseType = InferSchemaType<typeof licenseTypeSchema>;
export const LicenseTypeModel = model<LicenseType>('LicenseType', licenseTypeSchema);
