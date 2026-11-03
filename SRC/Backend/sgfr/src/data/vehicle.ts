import { Schema, model, InferSchemaType } from 'mongoose';

const vehicleSchema = new Schema(
  {
    licensePlate: { type: String, required: true, unique: true },
    vehicleType: { type: String, enmu: ["Auto", "Camion", "Moto","Furgon","Utilitario"], required: true },
    capacity: { type: Number, default: 1, required: true },
    status: { type: String, enum: ['Disponible', 'En ruta', 'En mantenimiento', 'Fuera de servicio'], required: true },
  },
  { timestamps: true }
);

export type Vehicle = InferSchemaType<typeof vehicleSchema>;
export const VehicleModel = model<Vehicle>('Vehicle', vehicleSchema);
