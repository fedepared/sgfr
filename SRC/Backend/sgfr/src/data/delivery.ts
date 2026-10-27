import {Schema, model, InferSchemaType} from  'mongoose';

const deliverySchema = new Schema({
    customer: {type: Schema.Types.ObjectId, ref: 'Customer'},
    address: {type: String, required: true},
    timeRange: {type: String, enum: ["8:00 a 13:00", "13:00 a 18", "18:00 a 23:00"]},
    status : {type: Schema.Types.ObjectId, ref: 'DeliveryStatus'},
    distance: {type: Number, required: true}
})

//lee el schema y arma el tipo
export type Delivery = InferSchemaType<typeof deliverySchema>;

//registra el schema y devuelve un modelo (objeto para consultar y escribir en la coleccion)
const DeliveryModel = model<Delivery>('Delivery', deliverySchema);