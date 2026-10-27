import {Schema, model, InferSchemaType} from  'mongoose';

const vehicleSchema = new Schema({
    licensePlate: {type: String, required: true},
    vehicleType: {type: Schema.Types.ObjectId, ref: 'VehicleType'},
    capacity: {type: Number, default: 0, required: true},
    status : {type: Schema.Types.ObjectId, ref: 'VehicleStatusType'}
},{timestamps: true})

//lee el schema y arma el tipo
export type Vehicle = InferSchemaType<typeof vehicleSchema>;

//registra el schema y devuelve un modelo (objeto para consultar y escribir en la coleccion)
const VehicleModel = model<Vehicle>('Vehicle', vehicleSchema);