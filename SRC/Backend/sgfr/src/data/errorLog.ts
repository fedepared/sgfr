import { Schema, model, InferSchemaType } from 'mongoose';

const errorLogSchema = new Schema(
  {
    level: { type: String, enum: ['error', 'warn', 'info'], default: 'error' },
    message: { type: String, required: true },
    stack: { type: String, default: null },
    endpoint: { type: String, default: null },
    method: { type: String, default: null },
    statusCode: { type: Number, default: 500 },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export type ErrorLog = InferSchemaType<typeof errorLogSchema>;
export const ErrorLogModel = model<ErrorLog>('ErrorLog', errorLogSchema);
