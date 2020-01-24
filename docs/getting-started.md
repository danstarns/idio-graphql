---
id: getting-started
title: Getting Started
---


idio-graphql provides a set of methods to enable developers to structure and modularize a GraphQL API into individual, maintainable, modules.

## Quick Start

---

`$ npm install idio-graphql apollo-server graphql-tag`

Examples use **[apollo-server](https://www.npmjs.com/package/apollo-server)** however, feel free to plug into your own solution. 

```javascript
const {
    combineNodes,
    GraphQLNode
} = require("idio-graphql");

const { ApolloServer } = require("apollo-server");
const gql = require("graphql-tag");

const User = new GraphQLNode({
    name: "User",
    typeDefs: gql`
        type User {
            id: ID
            name: String
            age: Int
        }

        type Query {
            user(id: ID!): User
        }
    `,
    resolvers: {
        Query: {
            user: (parent, { id }) => { ... }
        }
    }
});

async function main() {
    const { typeDefs, resolvers } = await combineNodes([ User ]);

    const server = new ApolloServer({ typeDefs, resolvers });

    await server.listen(4000);

    console.log(`Server up on port 4000 🚀`);
}

main();

```

## Guides

---

1. [**Creating Nodes**](creating-nodes)
2. [**Combine Nodes**](combine-nodes-guide)
4. [**Schema Appliances**](schema-appliances)
4. [**Resolver Hooks**](resolver-hooks)
3. [**Microservices**](microservices)

The guides are designed chronologically, Click the next button to start reading.