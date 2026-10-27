import {Schema, model, InferSchemaType} from  'mongoose';

const roadMapSchema = new Schema({
    date: {type: Date, required: true},
    vehicle: {type: Schema.Types.ObjectId, ref: 'Vehicle'},
    driver: {type: Schema.Types.ObjectId, ref: 'Driver'}
})

//lee el schema y arma el tipo
export type RoadMap = InferSchemaType<typeof roadMapSchema>;

//registra el schema y devuelve un modelo (objeto para consultar y escribir en la coleccion)
const RoadMapModel = model<RoadMap>('RoadMap', roadMapSchema);