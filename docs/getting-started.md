---
id: getting-started
title: Getting Started
---
[![CircleCI](https://circleci.com/gh/danstarns/idio-graphql/tree/master.svg?style=svg)](https://app.circleci.com/pipelines/github/danstarns/idio-graphql?branch=master) 

Node.js framework that enables engineers to effortlessly distribute a GraphQL schema across many files or communication channels. 

```shell
$ npm install idio-graphql
```

## Guides

---

1. [**Creating Nodes**](creating-nodes)
2. [**Combine Nodes**](combine-nodes-guide)
3. [**Schema Appliances**](schema-appliances)
4. [**Resolver Hooks**](resolver-hooks)
5. [**Microservices**](microservices)
6. [**Inter-Schema Execution**](inter-schema-execution)

## Examples 
---

1. [**RealWorld**](https://github.com/danstarns/idio-graphql-realworld-example-app) - You can find a RealWorld example here, alongside a matching React frontend.
2. [**Local**](https://github.com/danstarns/idio-graphql/blob/master/examples/local) - This project showcase's the most basic local setup with idio-graphql.
3. [**Microservice**](https://github.com/danstarns/idio-graphql/blob/master/examples/microservice) - This project showcase's the most basic microservice setup with idio-graphql.
4. [**Gradual Adoption**](https://github.com/danstarns/idio-graphql/blob/master/examples/gradual_adoption) - This project demonstrates how to gradually adopt a microservices architecture with idio-graphql.

## Contributing

---

**https://github.com/danstarns/idio-graphql/blob/master/contributing.md**

## Slack

---

**https://idio-graphql.slack.com**

## Quick Start

---

```shell
$ npm install idio-graphql apollo-server graphql-tag
```

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
    const { typeDefs, resolvers } = combineNodes([ User ]);

    const server = new ApolloServer({ typeDefs, resolvers });

    await server.listen(4000);

    console.log(`http://localhost:4000/graphql`);
}

main();

```

## Microservices Quick Start

---

> Requires **[nats-server](https://github.com/nats-io/nats-server)** @ 0.0.0.0:4222

```shell
$ npm install idio-graphql apollo-server graphql-tag moleculer nats
```


<!--DOCUSAURUS_CODE_TABS-->
<!--User Service-->

```js
const gql = require("graphql-tag");
const { GraphQLNode } = require("idio-graphql");

const User = new GraphQLNode({
    name: "User",
    typeDefs: gql`
        type User {
            id: String
            name: String
            age: Int
        }

        type Query {
            user(id: String!): User
            users(ids: [String]): [User]
        }
    `,
    resolvers: {
        Query: {
            user: (root, { id }) => { ... },
            users: (root, { ids }, { injections: { broker } }) => { ... }
        }
    }
});

async function main() {
    try {
        await User.serve({
            gateway: "gateway",
            transporter: "NATS"
        });

        console.log("User Online");
    } catch (error) {
        console.error(error);

        process.exit(1);
    }
}

main();
```

<!--Gateway Service-->
```js
const { ApolloServer } = require("apollo-server");
const { GraphQLGateway } = require("idio-graphql");

const gateway = new GraphQLGateway(
    { services: { nodes: ["User"] } },
    {
        transporter: "NATS",
        nodeID: "gateway"
    }
);

async function main() {
    try {
        const { typeDefs, resolvers } = await gateway.start();

        const server = new ApolloServer({
            typeDefs,
            resolvers
        });

        await server.listen(4000);

        console.log(`http://localhost:4000/graphql`);
    } catch (error) {
        console.error(error);

        process.exit(1);
    }
}

main();
```
<!--END_DOCUSAURUS_CODE_TABS-->


