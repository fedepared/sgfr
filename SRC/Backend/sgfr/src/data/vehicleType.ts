import {Schema, model, InferSchemaType} from 'mongoose';

const vehicleTypeSchema = new Schema({
    vehicleTypeName : {type: String, required: true}
},{timestamps: true})


//lee el schema y arma el tipo
export type VehicleType = InferSchemaType<typeof vehicleTypeSchema>;

//registra el schema y devuelve un modelo (objeto para consultar y escribir en la coleccion)
const vehicleTypeModel = model<VehicleType>('VehicleType', vehicleTypeSchema);