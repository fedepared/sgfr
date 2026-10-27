import {Schema, model, InferSchemaType} from 'mongoose';

const userSchema = new Schema ({
    userName : {type: String, required : true},
    passwordHash : {type: String , required: true},
    roleType : {type: Schema.Types.ObjectId, ref: 'Role'} 
    
})

//lee el schema y arma el tipo
export type User = InferSchemaType<typeof userSchema>;
//registra el schema y devuelve un modelo (objeto para consultar y escribir en la coleccion)
const UserModel = model<User>('User', userSchema);