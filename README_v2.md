# idio-graphql
[![CircleCI](https://circleci.com/gh/danstarns/idio-graphql/tree/master.svg?style=svg)](https://app.circleci.com/pipelines/github/danstarns/idio-graphql?branch=master)
[![CircleCI](https://img.shields.io/github/license/danstarns/idio-graphql)](https://github.com/danstarns/idio-graphql/blob/master/LICENSE) [![npm version](https://badge.fury.io/js/idio-graphql.svg)](https://www.npmjs.com/package/idio-graphql) [![Help Wanted!](https://img.shields.io/badge/help-wanted-brightgreen.svg?style=flat "Please Help Us")](https://github.com/danstarns/idio-graphql/issues) [![TypeScript Compatible](https://img.shields.io/npm/types/scrub-js.svg)](https://github.com/danstarns/idio-graphql/blob/master/index.d.ts)

# About
Node.js framework that enables engineers to effortlessly distribute a GraphQL schema across many files or communication channels.

## Integrate with 
1. [apollo-server]() ✔
2. [molecular]() ✔
3. [graphql-tools]() ✔
4. [graphql-upload]() 🏗

> This package is inspired by and or build's upon; Apollo Federation, GraphQL Modules & Moleculer.

## Aim
Provide a clean & structured API where engineers can prototype, build and integrate GraphQL Schemas with new or existing applications. Abstractions have been, and will continue, to be built that handle parts such as; schema splitting, modular patters & microservices.

## Examples
> Got a application you want to showcase? Make a PR and edit the README [here](https://github.com/danstarns/idio-graphql)

1. [Realworld Monolith GraphQL API]()
2. [Realworld GraphQL Microservices]()
3. [Mini Examples](https://github.com/danstarns/idio-graphql/blob/master/examples/EXAMPLES.md) - Some smaller examples to help demonstrate the capability's of this package.

## Links
1. [Documentation]()
2. [Slack]()
3. [GitHub]()
4. [NPM]()

## FAQ

### How do I integrate with my Apollo server ?
This package generates its schema with the help from [makeExecutableSchema](https://www.apollographql.com/docs/graphql-tools/generate-schema/). The result of `makeExecutableSchema` is returned from `combineNodes` & `GraphQLSchema`.

### How do I get started with microservices ?

This package builds its microservices features on top of a package [Molecular](), this means you can integrate with Moleculer's features. 

> Molecular is a optional dependency 

You don't need to change much code & you can 'spin up' a service with code as follows;

```javascript
const User = new GraphQLNode({
    name: "User"
});

await User.serve({
    transporter: "nats://localhost"
});
```

# Quick Start
```
$ npm install idio-graphql apollo-server graphql-tag
```

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

# Microservices Quick Start

> Requires [nats-server](https://github.com/nats-io/nats-server) @ nats://localhost:4222

```
$ npm install idio-graphql apollo-server graphql-tag moleculer nats
```

## User Service

```javascript
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

## Gateway Service

```javascript
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