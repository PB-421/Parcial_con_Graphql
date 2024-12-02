import {ObjectId} from "mongodb"

export type modelPersona = {
    _id?: ObjectId,
    name: string,
    email: string,
    phone: string,
    friends: ObjectId[]
}

export type amigo = {
    id: string,
    name: string,
    email: string,
    phone: string
}

export type persona = {
    id: string,
    name: string,
    email: string,
    phone: string,
    friends: amigo[]
}