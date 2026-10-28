import { Schema, model, InferSchemaType } from 'mongoose';

const deliveryAnnotationSchema = new Schema(
  {
    delivery: { type: Schema.Types.ObjectId, ref: 'Delivery', required: true },
    deliveryStatus: { type: Schema.Types.ObjectId, ref: 'DeliveryStatus', required: true },
    detail: { type: String, required: true, minLength: 0, maxLength: 200 },
  },
  { timestamps: true }
);

export type DeliveryAnnotation = InferSchemaType<typeof deliveryAnnotationSchema>;
export const DeliveryAnnotationModel = model<DeliveryAnnotation>('DeliveryAnnotation', deliveryAnnotationSchema);
