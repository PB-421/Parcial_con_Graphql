

export const squema = `#graphql

    type Amigo {
        id: String!
        name: String!
        email: String!
        phone: String!
    }

    type Person {
        id: String!
        name: String!
        email: String!
        phone: String!
        friends: [Amigo!]!
    }

    type Query {
        getPersonas(name: String): [Person!]!
        getPersona(email: String, phone: String): Person
    }

    type Mutation {
        addPersona(name: String!,email: String!,phone: String!,friends:[String!]): Person
        updatePersona(name: String, email: String!, emailNuevo:String, phone: String, friends: [String!]): Person
        deletePersona(email: String!): String!
    }
`