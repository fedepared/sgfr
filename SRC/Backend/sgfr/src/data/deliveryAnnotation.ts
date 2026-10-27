import {Schema, model, InferSchemaType} from  'mongoose';

const deliveryAnnotationSchema = new Schema({
    delivery: {type: Schema.Types.ObjectId, ref: 'Delivery'},
    deliveryStatus: {type: Schema.Types.ObjectId, ref: 'DeliveryStatus'},
    detail: {type: String, required: true, minLength: 0, maxLength: 200}
})

//lee el schema y arma el tipo
export type DeliveryAnnotation = InferSchemaType<typeof deliveryAnnotationSchema>;

//registra el schema y devuelve un modelo (objeto para consultar y escribir en la coleccion)
const DeliveryAnnotationModel = model<DeliveryAnnotation>('DeliveryAnnotation', deliveryAnnotationSchema);