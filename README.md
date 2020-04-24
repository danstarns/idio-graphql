# idio-graphql
[![CircleCI](https://circleci.com/gh/danstarns/idio-graphql/tree/master.svg?style=svg)](https://app.circleci.com/pipelines/github/danstarns/idio-graphql?branch=master)
[![CircleCI](https://img.shields.io/github/license/danstarns/idio-graphql)](https://github.com/danstarns/idio-graphql/blob/master/LICENSE) [![npm version](https://badge.fury.io/js/idio-graphql.svg)](https://www.npmjs.com/package/idio-graphql) [![Help Wanted!](https://img.shields.io/badge/help-wanted-brightgreen.svg?style=flat "Please Help Us")](https://github.com/danstarns/idio-graphql/issues) [![TypeScript Compatible](https://img.shields.io/npm/types/scrub-js.svg)](https://github.com/danstarns/idio-graphql/blob/master/index.d.ts)

```
$ npm install idio-graphql
```

# Index
1. [About](#about)
    * [Integrations](#integrates-with)
    * [Aim](#aim)
    * [Examples](#examples)
    * [Links](#links)
    * [FAQ](#faq)
    * [Contributing](https://github.com/danstarns/idio-graphql/blob/master/contributing.md)
2. [Quick Start](#quick-start)
    * [Modules](#quick-start)
    * [Microservices](#microservices-quick-start)
3. [Guides](https://danstarns.github.io/idio-graphql/docs/getting-started#guides)
    * [Creating Nodes](https://danstarns.github.io/idio-graphql/docs/creating-nodes)
    * [Combining Nodes](https://danstarns.github.io/idio-graphql/docs/combine-nodes-guide)
    * [Schema Appliances](https://danstarns.github.io/idio-graphql/docs/schema-appliances)
    * [Resolver Hooks](https://danstarns.github.io/idio-graphql/docs/resolver-hooks)
    * [Microservices](https://danstarns.github.io/idio-graphql/docs/microservices)
    * [Inter-Schema Execution](https://danstarns.github.io/idio-graphql/docs/inter-schema-execution)
4. [API](https://danstarns.github.io/idio-graphql/docs/)
    * [GraphQLNode](https://danstarns.github.io/idio-graphql/docs/graphql-node)
    * [combineNodes](https://danstarns.github.io/idio-graphql/docs/combine-nodes)
    * [GraphQLGateway](https://danstarns.github.io/idio-graphql/docs/graphql-gateway)
    * [IdioEnum](https://danstarns.github.io/idio-graphql/docs/idio-enum)
    * [IdioScalar](https://danstarns.github.io/idio-graphql/docs/idio-scalar)
    * [IdioDirective](https://danstarns.github.io/idio-graphql/docs/idio-directive)
    * [IdioInterface](https://danstarns.github.io/idio-graphql/docs/idio-interface)
    * [IdioUnion](https://danstarns.github.io/idio-graphql/docs/idio-union)
    * [GraphQLType](https://danstarns.github.io/idio-graphql/docs/graphql-type)


# About
Node.js framework that enables engineers to effortlessly distribute a GraphQL schema across many files or communication channels.

## Integrates with 
1. [apollo-server](https://github.com/apollographql/apollo-server) ✔
2. [molecular](https://moleculer.services/) ✔
3. [graphql-tools](https://github.com/Urigo/graphql-tools) ✔
4. [graphql-upload](https://github.com/jaydenseric/graphql-upload) 🏗

> This package is inspired by and or build's upon; Apollo Federation, GraphQL Modules & Moleculer.

## Aim
Provide a clean & structured API where engineers can prototype, build and integrate GraphQL Schemas with new or existing applications. Abstractions have been, will continue, to be built that handle parts such as; schema splitting, modular patters & microservices.

## Examples
> Got an application you want to showcase? Make a PR and edit the README [here](https://github.com/danstarns/idio-graphql)

1. [Real world Monolith GraphQL API](https://github.com/danstarns/idio-graphql-realworld-example-app)
2. [Real world GraphQL Microservices System](https://github.com/danstarns/graphql-microservices-realworld-example-system)
3. [Mini Examples](https://github.com/danstarns/idio-graphql/blob/master/examples/EXAMPLES.md) - Some smaller examples to help demonstrate the capability's of this package.

## Links
1. [Documentation](https://danstarns.github.io/idio-graphql/)
2. [Slack](https://idio-graphql.slack.com)
3. [GitHub](https://github.com/danstarns/idio-graphql)
4. [NPM](https://www.npmjs.com/package/idio-graphql)

## FAQ

### How do I integrate with my Apollo server ?
This package generates its schema with the help from [makeExecutableSchema](https://www.apollographql.com/docs/graphql-tools/generate-schema/). The result of `makeExecutableSchema` is returned from `combineNodes` & `GraphQLSchema`.

Using [combineNodes](https://danstarns.github.io/idio-graphql/docs/combine-nodes)

```javascript
const { typeDefs, resolvers } = combineNodes(nodes);

const apolloServer = new ApolloServer({ typeDefs, resolvers });
```
Using [GraphQLGateway](https://danstarns.github.io/idio-graphql/docs/graphql-gateway)

```javascript
const { typeDefs, resolvers } = combineNodes(nodes);

const gateway = new GraphQLGateway(
    {
        services: {
            nodes: ["User"]
        }
    },
    {
        transporter: "redis://localhost",
        nodeID: "gateway"
    }
);

const { typeDefs, resolvers } = await gateway.start();

const apolloServer = new ApolloServer({ typeDefs, resolvers });
```
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

> Do not forget to start your [gateway](https://danstarns.github.io/idio-graphql/docs/graphql-gateway)

```javascript
const gateway = new GraphQLGateway(
    {
        services: {
            nodes: ["User"]
        }
    },
    {
        transporter: "nats://localhost",
        nodeID: "gateway"
    }
);
```

> Learn more about using microservices [here](https://danstarns.github.io/idio-graphql/docs/microservices)


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
        }
    `,
    resolvers: {
        Query: {
            user: (root, { id }) => { ... }
        }
    }
});

await User.serve({
    gateway: "gateway",
    transporter: "NATS"
});
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

const { typeDefs, resolvers } = await gateway.start();

const server = new ApolloServer({
    typeDefs,
    resolvers
});

await server.listen(4000);
```