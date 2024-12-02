import { Collection, ObjectId } from "mongodb";
import { modelPersona, persona } from "./types.ts";
import { comprobacionEmail, comprobacionPhone, esElMismo, fromModelToPersona, tieneRepetidos } from "./utils.ts";
import { comprobacionId } from "./utils.ts";

type Args = {
    name: string | null,
    email: string | null,
    emailNuevo: string | null,
    phone: string | null,
    friends: string[] | null
} 

export const resolvers = {
    Query: {
        getPersonas:async (_:unknown,args: Args,context: {collectionPersonas:Collection<modelPersona>}):Promise<persona[]> => {

            if(args.name){
                const listaI:modelPersona[] = await context.collectionPersonas.find({name: args.name}).toArray()
                const lista:persona[] = await Promise.all(listaI.map((elem) => fromModelToPersona(elem,context.collectionPersonas)))
                return lista
            }
            const listaI:modelPersona[] = await context.collectionPersonas.find().toArray()
            const lista:persona[] = await Promise.all(listaI.map((elem) => fromModelToPersona(elem,context.collectionPersonas)))
            return lista
        },
        getPersona: async (_: unknown, args: Args,context: {collectionPersonas:Collection<modelPersona>}):Promise<persona | null> => {

            const query: Record<string, unknown> = {} //Creamos un registro de los valores que hemos recogido

            if (args.email) query.email = args.email
            if (args.phone) query.phone = args.phone

            // Si no hay email ni phone, devolvemos null
            if (!Object.keys(query).length) return null

            const listaI:modelPersona | null = await context.collectionPersonas.findOne(query)

            if(listaI){
            return fromModelToPersona(listaI,context.collectionPersonas)
            }
            return null
        }
    },
    Mutation: {
        addPersona: async (_:unknown,args: Args,context: {collectionPersonas:Collection<modelPersona>}):Promise<persona | null> => {
            if(args.name && args.email && args.phone){
                const query: Record<string, unknown> = {} //Creamos un registro de los valores que hemos recogido

                if (args.friends) query.friends = args.friends

                if (!Object.keys(query).length) {
                    if(await comprobacionEmail(args.email,context.collectionPersonas) || await comprobacionPhone(args.phone,context.collectionPersonas)){
                        return null
                    }
                    const {insertedId} = await context.collectionPersonas.insertOne({
                        name: args.name,
                        email: args.email,
                        phone: args.phone,
                        friends: []
                    })

                    return {
                        id: insertedId.toString(),
                        name: args.name,
                        email: args.email,
                        phone: args.phone,
                        friends: []
                    }
                }
                if(args.friends){
                    if(!args.friends.every((elem:string) => comprobacionId(elem,context.collectionPersonas))){
                        return null
                    }
                    if(await comprobacionEmail(args.email,context.collectionPersonas) || await comprobacionPhone(args.phone,context.collectionPersonas)){
                        return null
                    }
                    const {insertedId} = await context.collectionPersonas.insertOne({
                        name: args.name,
                        email: args.email,
                        phone: args.phone,
                        friends: args.friends.map((elem) => new ObjectId(elem))
                    })

                    const personaN = await context.collectionPersonas.findOne({_id: insertedId})
                    if(personaN){
                    return fromModelToPersona(personaN,context.collectionPersonas)
                    }
                }
            }
            return null
        },
        updatePersona: async (_: unknown, args: Args,context: {collectionPersonas:Collection<modelPersona>}):Promise<persona | null> => {
            if(args.email){
                if(await comprobacionEmail(args.email,context.collectionPersonas)){
                    const query: Record<string, unknown> = {} 

                    if (args.name) query.name = args.name
                    if (args.emailNuevo) query.emailNuevo = args.emailNuevo
                    if (args.phone) query.phone = args.phone
                    if (args.friends) query.friends = args.friends

                    if (!Object.keys(query).length) {
                        const persona = await context.collectionPersonas.findOne({email: args.email})
                        if(persona){
                            return fromModelToPersona(persona,context.collectionPersonas)
                        }
                    }

                    let persona = await context.collectionPersonas.findOne({email: args.email})
                    if(!persona){
                        return null
                    }
                    const id = persona._id

                    if(args.emailNuevo){
                        if(await comprobacionEmail(args.emailNuevo,context.collectionPersonas)){
                            return null
                        }
                    }
                    if(args.phone){
                        if(await comprobacionPhone(args.phone,context.collectionPersonas)){
                            return null
                        }
                    }
                    let friendsOB = null
                    if(args.friends){
                        if(tieneRepetidos(args.friends)|| args.friends.some((elem:string) => esElMismo(elem,id.toString()))){
                            return null
                        }
                        const compr = args.friends.every((elem:string) => comprobacionId(elem,context.collectionPersonas))
                        if(!compr){
                            return null
                        }
                        friendsOB = args.friends.map((elem) => new ObjectId(elem))
                    }
                    const set = {
                        name: args.name ?? persona.name,
                        email: args.emailNuevo ?? persona.email,
                        phone: args.phone ?? persona.phone,
                        friends: friendsOB ?? persona.friends
                    }
                    await context.collectionPersonas.updateOne({email: args.email},
                        {$set: set}
                    )
                    persona = await context.collectionPersonas.findOne({_id: id})
                    if(!persona){
                        return null
                    }
                    return fromModelToPersona(persona,context.collectionPersonas)
                }
            }
            return null
        },
        deletePersona: async (_:unknown,args: {email: string},context: {collectionPersonas:Collection<modelPersona>}):Promise<string> => {
            if(args.email){
                if(await comprobacionEmail(args.email,context.collectionPersonas)){
                    const persona = await context.collectionPersonas.findOne({email: args.email})
                    if(!persona){
                        return "Email no encontrado"
                    }
                    const id = persona._id
                    await context.collectionPersonas.updateMany({},
                    {$pull: {friends: id}}
                    )
                    await context.collectionPersonas.deleteOne({_id: id})

                    return "Persona eliminada"
                }
                return "Email no encontrado"
            }
            return "Email no introducido"
        }
    }
}