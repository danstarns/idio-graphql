# idio-graphql
[![CircleCI](https://circleci.com/gh/danstarns/idio-graphql/tree/master.svg?style=svg)](https://app.circleci.com/pipelines/github/danstarns/idio-graphql?branch=master)
[![CircleCI](https://img.shields.io/github/license/danstarns/idio-graphql)](https://github.com/danstarns/idio-graphql/blob/master/LICENSE) [![npm version](https://badge.fury.io/js/idio-graphql.svg)](https://www.npmjs.com/package/idio-graphql) [![Help Wanted!](https://img.shields.io/badge/help-wanted-brightgreen.svg?style=flat "Please Help Us")](https://github.com/danstarns/idio-graphql/issues) [![TypeScript Compatible](https://img.shields.io/npm/types/scrub-js.svg)](https://github.com/danstarns/idio-graphql/blob/master/index.d.ts)

```
$ npm install idio-graphql
```

# Index
1. [About](#About)
    * [Integrations](##Integrate-with)
    * [Aim](##Aim)
    * [Examples](##Examples)
    * [Links](##Links)
    * [FAQ](##FAQ)
    * [Contributing](https://github.com/danstarns/idio-graphql/blob/master/contributing.md)
2. [Quick Start](#Quick-Start)
    * [Modules](#Quick-Start)
    * [Microservices](##Microservices-Quick-Start)

# About
Node.js framework that enables engineers to effortlessly distribute a GraphQL schema across many files or communication channels.

## Integrate with 
1. [apollo-server](https://github.com/apollographql/apollo-server) ✔
2. [molecular](https://moleculer.services/) ✔
3. [graphql-tools](https://github.com/Urigo/graphql-tools) ✔
4. [graphql-upload](https://github.com/jaydenseric/graphql-upload) 🏗

> This package is inspired by and or build's upon; Apollo Federation, GraphQL Modules & Moleculer.

## Aim
Provide a clean & structured API where engineers can prototype, build and integrate GraphQL Schemas with new or existing applications. Abstractions have been, will continue, to be built that handle parts such as; schema splitting, modular patters & microservices.

## Examples
> Got an application you want to showcase? Make a PR and edit the README [here](https://github.com/danstarns/idio-graphql)

1. [Realworld Monolith GraphQL API](https://github.com/danstarns/idio-graphql-realworld-example-app)
2. [Realworld GraphQL Microservices](https://github.com/danstarns/graphql-microservices-realworld-example-system)
3. [Mini Examples](https://github.com/danstarns/idio-graphql/blob/master/examples/EXAMPLES.md) - Some smaller examples to help demonstrate the capability's of this package.

## Links
1. [Documentation](https://danstarns.github.io/idio-graphql/)
2. [Slack](https://idio-graphql.slack.com)
3. [GitHub](https://github.com/danstarns/idio-graphql)
4. [NPM](https://www.npmjs.com/package/idio-graphql)

## FAQ

### How do I integrate with my Apollo server ?
This package generates its schema with the help from [makeExecutableSchema](https://www.apollographql.com/docs/graphql-tools/generate-schema/). The result of `makeExecutableSchema` is returned from `combineNodes` & `GraphQLSchema`.

### How do I get started with microservices ?

This package builds its microservices features on top of a package [Molecular](https://moleculer.services/), this means you can integrate with Moleculer's features. 

> Molecular is a optional dependency 

You don't need to change much code & you can 'spin up' a service with as little as;

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

> Read more [here](https://danstarns.github.io/idio-graphql/docs/microservices)

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