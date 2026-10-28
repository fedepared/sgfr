import { Schema, model, InferSchemaType } from 'mongoose';

const deliveryStatusSchema = new Schema(
  {
    description: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export type DeliveryStatus = InferSchemaType<typeof deliveryStatusSchema>;
export const DeliveryStatusModel = model<DeliveryStatus>('DeliveryStatus', deliveryStatusSchema);
