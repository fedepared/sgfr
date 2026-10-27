import {Schema, model, InferSchemaType} from  'mongoose';

const driverSchema = new Schema({
    name: {type: String, required: true},
    lastName: {type: String, required: true},
    idCard: {type: Number, default: 0, required: true},
    licenseType: {type: Schema.Types.ObjectId, ref: 'LicenseType'}
},{timestamps: true})

//lee el schema y arma el tipo
export type Driver = InferSchemaType<typeof driverSchema>;

//registra el schema y devuelve un modelo (objeto para consultar y escribir en la coleccion)
const DriverModel = model<Driver>('Driver', driverSchema);