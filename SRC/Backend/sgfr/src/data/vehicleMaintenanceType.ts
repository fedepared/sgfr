import {Schema, model, InferSchemaType} from  'mongoose';

const vehicleMaintenanceTypeSchema = new Schema({
    description: {type: String, required: true}
},{timestamps: true})

//lee el schema y arma el tipo
export type VehicleMaintenanceType = InferSchemaType<typeof vehicleMaintenanceTypeSchema>;

//registra el schema y devuelve un modelo (objeto para consultar y escribir en la coleccion)
const VehicleMaintenanceTypeModel = model<VehicleMaintenanceType>('VehicleMaintenanceType', vehicleMaintenanceTypeSchema);