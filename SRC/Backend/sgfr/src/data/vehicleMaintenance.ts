import {Schema, model, InferSchemaType} from  'mongoose';

const vehicleMaintenanceSchema = new Schema({
    vehicleMaintenanceType: {type: Schema.Types.ObjectId, ref: 'VehicleMaintenanceType'},
    vehicle: {type: Schema.Types.ObjectId, ref: 'Vehicle'},
    price : {type: Number, required: true}
},{timestamps: true})

//lee el schema y arma el tipo
export type VehicleMaintenance = InferSchemaType<typeof vehicleMaintenanceSchema>;

//registra el schema y devuelve un modelo (objeto para consultar y escribir en la coleccion)
const VehicleMaintenanceModel = model<VehicleMaintenance>('VehicleMaintenance', vehicleMaintenanceSchema);