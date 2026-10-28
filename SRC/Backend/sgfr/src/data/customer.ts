import { Schema, model, InferSchemaType } from 'mongoose';

const customerSchema = new Schema(
  {
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    idCard: { type: Number, default: 0, required: true },
    addresses: { type: [String], default: [], required: true },
  },
  { timestamps: true }
);

export type Customer = InferSchemaType<typeof customerSchema>;
export const CustomerModel = model<Customer>('Customer', customerSchema);
