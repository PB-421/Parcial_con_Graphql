import { Collection, ObjectId } from "mongodb";
import { modelPersona, persona, amigo } from "./types.ts";

export function fromModelToAmigo(personaOG: modelPersona):amigo {
    return{
        id: personaOG._id!.toString(),
        name: personaOG.name,
        email: personaOG.email,
        phone: personaOG.phone
    }
}

export function tieneRepetidos(array: string[]): boolean { //ver si un array tiene valores repeditos
    const uniqueElements = new Set(array);
    return uniqueElements.size !== array.length;
}

export function esElMismo(idAmigo:string,idP:string):boolean {
    if(idAmigo === idP){
        return true
    }
    return false
}

export async function comprobacionId(id: string,Lista:Collection<modelPersona>):Promise<boolean> {
    const encontrado = await Lista.findOne({_id: new ObjectId(id)})

    if(encontrado) return true

    return false
}

export async function comprobacionEmail(email: string,Lista:Collection<modelPersona>):Promise<boolean> {
    const encontrado = await Lista.findOne({email: email})

    if(encontrado) return true

    return false
}

export async function comprobacionPhone(phone: string,Lista:Collection<modelPersona>):Promise<boolean> {
    const encontrado = await Lista.findOne({phone: phone})

    if(encontrado) return true

    return false
}

export async function fromModelToPersona(personaOG:modelPersona,Lista:Collection<modelPersona>):Promise<persona> {

    const idsAmigos:ObjectId[] = personaOG.friends

    const ListaAmigos:modelPersona[] = await Lista.find({_id: {$in: idsAmigos}}).toArray()

    return{
        id: personaOG._id!.toString(),
        name: personaOG.name,
        email: personaOG.email,
        phone: personaOG.phone,
        friends: ListaAmigos.map((elem:modelPersona) => fromModelToAmigo(elem))
    }
}