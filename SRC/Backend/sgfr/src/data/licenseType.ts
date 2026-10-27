import {Schema, model, InferSchemaType} from  'mongoose';

const licenseTypeSchema = new Schema({
    licenseTypeLetter: {type: String, required: true, minLength:1,maxLength:1},
    licenseTypeNumber: {type: Number, required: true, min: 1, max:4},
    description: {type: String, default: 0, required: true}
})

//lee el schema y arma el tipo
export type LicenseType = InferSchemaType<typeof licenseTypeSchema>;

//registra el schema y devuelve un modelo (objeto para consultar y escribir en la coleccion)
const licenseTypeModel = model<LicenseType>('LicenseType', licenseTypeSchema);