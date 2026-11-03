import { Schema, model, InferSchemaType } from 'mongoose';
import { deliveryAnnotationSchema } from './deliveryAnnotation';

export const deliverySchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    address: { type: String, required: true },
    timeRange: { type: String, enum: ['8:00 a 13:00', '13:00 a 18:00', '18:00 a 23:00'], required: true },
    status: { type: String, enum: ["Creado","En Preparación","En camino","Entregado","Fallo en la entrega"], default: "Creado"},
    distance: { type: Number, required: true },
    annotations: { type: [deliveryAnnotationSchema] }
  },
  { timestamps: true }
);

export type Delivery = InferSchemaType<typeof deliverySchema>;
export const DeliveryModel = model<Delivery>('Delivery', deliverySchema);
