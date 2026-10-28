import { Schema, model, InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    userName: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    roleType: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof userSchema>;
export const UserModel = model<User>('User', userSchema);
