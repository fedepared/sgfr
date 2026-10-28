import { Schema, model, InferSchemaType } from 'mongoose';

const roadMapSchema = new Schema(
  {
    date: { type: Date, required: true },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
  },
  { timestamps: true }
);

export type RoadMap = InferSchemaType<typeof roadMapSchema>;
export const RoadMapModel = model<RoadMap>('RoadMap', roadMapSchema);
