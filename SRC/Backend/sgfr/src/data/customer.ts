import {Schema, model, InferSchemaType} from  'mongoose';

const customerSchema = new Schema({
    name: {type: String, required: true},
    lastName: {type: String, required: true},
    idCard: {type: Number, default: 0, required: true},
    addresses : {type: [String], default: [], required: true}
},{timestamps: true})

//lee el schema y arma el tipo
export type Customer = InferSchemaType<typeof customerSchema>;

//registra el schema y devuelve un modelo (objeto para consultar y escribir en la coleccion)
const CustomerModel = model<Customer>('Customer', customerSchema);