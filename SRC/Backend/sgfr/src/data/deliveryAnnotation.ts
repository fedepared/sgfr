import { Schema, model, InferSchemaType } from 'mongoose';

export const deliveryAnnotationSchema = new Schema(
  {
    detail: { type: String, required: true, minLength: 0, maxLength: 200 },
    status: { type: String, enum: ["Creado","En Preparación","En camino","Entregado","Fallo en la entrega"], default: "Creado"},
  },
  { timestamps: true }
);

export type DeliveryAnnotation = InferSchemaType<typeof deliveryAnnotationSchema>;
export const DeliveryAnnotationModel = model<DeliveryAnnotation>('DeliveryAnnotation', deliveryAnnotationSchema);
