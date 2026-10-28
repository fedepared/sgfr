import { Schema, model, InferSchemaType } from 'mongoose';

const roleSchema = new Schema(
  {
    roleName: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export type Role = InferSchemaType<typeof roleSchema>;
export const RoleModel = model<Role>('Role', roleSchema);
