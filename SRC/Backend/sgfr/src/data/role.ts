import {Schema, model, InferSchemaType} from 'mongoose';

const roleSchema = new Schema({
    roleName : { type: String, required: true }
},{timestamps: true})

//lee el schema y arma el tipo
export type Role = InferSchemaType<typeof roleSchema>;

//registra el schema y devuelve un modelo (objeto para consultar y escribir en la coleccion)
const RoleModel = model<Role>('Role', roleSchema);
 