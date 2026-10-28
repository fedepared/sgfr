import { Schema, model, InferSchemaType } from 'mongoose';

const deliverySchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    address: { type: String, required: true },
    timeRange: { type: String, enum: ['8:00 a 13:00', '13:00 a 18:00', '18:00 a 23:00'], required: true },
    status: { type: Schema.Types.ObjectId, ref: 'DeliveryStatus', required: true },
    distance: { type: Number, required: true },
    roadMap: { type: Schema.Types.ObjectId, ref: 'RoadMap', default: null },
  },
  { timestamps: true }
);

export type Delivery = InferSchemaType<typeof deliverySchema>;
export const DeliveryModel = model<Delivery>('Delivery', deliverySchema);
