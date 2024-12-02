import { MongoClient } from "mongodb";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { squema } from "./squema.ts";
import {resolvers} from "./resolvers.ts"

const urlMongo = Deno.env.get("MONGO_URL")

if(!urlMongo){
    console.error("Se necesita una url de mongo")
    Deno.exit(-1)
}

const client = new MongoClient(urlMongo);

  // Use connect method to connect to the server
await client.connect();
console.log('Connected successfully to server');
const db = client.db('Prueba_Graph');
const collectionPersonas = db.collection('People_Parcial');

const server = new ApolloServer({
  typeDefs: squema,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 8000 }, context: async () => ({collectionPersonas})
});

console.log(`Server running on: ${url}`);
