import {Schema, model, InferSchemaType} from  'mongoose';

const deliveryStatusSchema = new Schema({
    description: {type: String, required: true}
},{timestamps: true})

//lee el schema y arma el tipo
export type DeliveryStatus = InferSchemaType<typeof deliveryStatusSchema>;

//registra el schema y devuelve un modelo (objeto para consultar y escribir en la coleccion)
const DeliveryStatusModel = model<DeliveryStatus>('DeliveryStatus', deliveryStatusSchema);