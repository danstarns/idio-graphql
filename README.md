# idio-graphql
[![CircleCI](https://circleci.com/gh/danstarns/idio-graphql/tree/master.svg?style=svg)](https://app.circleci.com/pipelines/github/danstarns/idio-graphql?branch=master)
[![CircleCI](https://img.shields.io/github/license/danstarns/idio-graphql)](https://github.com/danstarns/idio-graphql/blob/master/LICENSE) [![npm version](https://badge.fury.io/js/idio-graphql.svg)](https://www.npmjs.com/package/idio-graphql) [![Help Wanted!](https://img.shields.io/badge/help-wanted-brightgreen.svg?style=flat "Please Help Us")](https://github.com/danstarns/idio-graphql/issues) [![TypeScript Compatible](https://img.shields.io/npm/types/scrub-js.svg)](https://github.com/danstarns/idio-graphql/blob/master/index.d.ts)

# About
Node.js framework that enables engineers to effortlessly distribute a GraphQL schema across many files or communication channels.

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

## Integrates with 
1. [apollo-server](https://github.com/apollographql/apollo-server) ✔
2. [molecular](https://moleculer.services/) ✔
3. [graphql-tools](https://github.com/Urigo/graphql-tools) ✔
4. [graphql-upload](https://github.com/jaydenseric/graphql-upload) 🏗
5. [graphql-tag](https://github.com/apollographql/graphql-tag) ✔

> This package is inspired by and or build's upon; Apollo Federation, GraphQL Modules & Moleculer.

## Aim
Provide a clean & structured API where engineers can prototype, build and integrate GraphQL Schemas with new or existing applications. Abstractions have been, will continue, to be built that handle parts such as; schema splitting, modular patters & microservices.

## Examples
> Got an application you want to showcase? Make a PR and edit the README [here](https://github.com/danstarns/idio-graphql)

1. [Monolith](https://github.com/danstarns/idio-graphql-realworld-example-app)
2. [Microservice](https://github.com/danstarns/graphql-microservices-realworld-example-system)
3. [Mini examples](https://github.com/danstarns/idio-graphql/blob/master/examples/EXAMPLES.md) - Some smaller examples to help demonstrate the capability's of this package.

## Links
1. [Documentation](https://danstarns.github.io/idio-graphql/)
2. [Slack](https://idio-graphql.slack.com)
3. [GitHub](https://github.com/danstarns/idio-graphql)
4. [NPM](https://www.npmjs.com/package/idio-graphql)

## FAQ

1. [What is a node ?](#what-is-a-node-)
2. [How do I integrate with my Apollo server ?](#how-do-i-integrate-with-my-apollo-server-)
3. [How do I get started with microservices ?](#how-do-i-get-started-with-microservices-)
4. [Can I use schema directives ?](#can-i-use-schema-directives-)
5. [How can my nodes talk with each other ?](#how-can-my-nodes-talk-with-each-other-)
6. [Does it support graphql files or graphql tag ?](#does-it-support-graphql-files-or-graphql-tag-)
7. [What is the role of the gateway ?](#what-is-the-role-of-the-gateway-)

### What is a node ?

---

A [Node](https://danstarns.github.io/idio-graphql/docs/graphql-node) is designed to modularize a [ObjectTypeDefinition](http://spec.graphql.org/June2018/#ObjectTypeDefinition) together with its related resolvers & properties. You can think of a node as a module.

```javascript
const User = new GraphQLNode({
    name: "User",
    typeDefs: `
        type User ...

        type Query {
            getUser: User
        }
    `,
    resolvers: {
        Query: {
            getUser: (root, args, ctx) => { ... }
        }
    }
});
```

> You can compose nodes

```javascript
const Comment = new GraphQLNode({
    name: "Comment",
    ...
});

const Post = new GraphQLNode({
    name: "Post",
    nodes: [ Comment ],
    ...
});

const User = new GraphQLNode({
    name: "User",
    nodes: [ Post ]
    ...
});
```

#### Is it all about nodes ?
No! There are plenty of classes to help you construct your GraphQL schema start reading about schemaAppliances [here](https://danstarns.github.io/idio-graphql/docs/schema-appliances).

### How do I integrate with my Apollo server ?

---

This package generates its schema with the help from [makeExecutableSchema](https://www.apollographql.com/docs/graphql-tools/generate-schema/). The result of `makeExecutableSchema` is returned from `combineNodes` & `GraphQLSchema`.

Using [combineNodes](https://danstarns.github.io/idio-graphql/docs/combine-nodes)

```javascript
const { typeDefs, resolvers } = combineNodes(nodes);

const apolloServer = new ApolloServer({ typeDefs, resolvers });
```
Using [GraphQLGateway](https://danstarns.github.io/idio-graphql/docs/graphql-gateway)

```javascript
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

---

This package builds its microservices features on top of a package [Molecular](https://moleculer.services/), this means you can integrate with Moleculer's features. Learn more about using microservices [here](https://danstarns.github.io/idio-graphql/docs/microservices).

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

> Do not forget to create your [gateway](https://danstarns.github.io/idio-graphql/docs/graphql-gateway)

#### Gradual Adoption
You don't need have to have all your nodes as a service. You can have some nodes hosted on the same instance as the gateway. Use `locals` & `services` in [GraphQLGateway](https://danstarns.github.io/idio-graphql/docs/graphql-gateway) to merge all nodes together. Read more about gradual adoption [here](https://danstarns.github.io/idio-graphql/docs/microservices#gradual-adoption).

### Can I use schema directives ?

---

Yes! You should use a [IdioDirective](https://danstarns.github.io/idio-graphql/docs/idio-directive) and apply it at `combineNodes` or `GraphQLGateway`.

```javascript
const MyDirective = new IdioDirective({
    name: "...",
    typeDefs: ` ... `,
    resolver: SchemaDirectiveVisitor
});

const { typeDefs, resolvers, schemaDirectives } = combineNodes(nodes, { directives: [MyDirective] });
```

### How can my nodes talk with each other ?

---

This package introduces a powerful feature [Inter-Schema Execution](https://danstarns.github.io/idio-graphql/docs/inter-schema-execution). You can use this to make GraphQL powered Queries & Mutations against your own or specified schema. We use dependency injection to provide useful functions, at runtime, for your disposal. 

> Inter-Schema Execution works with your served nodes, this will allow you to accomplish GraphQL powered service-service communication.

```javascript
const Post = new GraphQLNode({
    name: "Post",
    typeDefs: `
        type Post {
            posts: {
                title
            }
        }
        
        type Query {
            posts: [Post]
        }
    `,
    resolvers: { ... }
});

const User = new GraphQLNode({
    name: "User",
    typeDefs: `
        type User {
            posts: [Post]
        }
    `,
    resolvers: {
        Fields: {
            post: async (root, args, { injections }) => {
                const { data, errors } = await injections.execute(
                    `
                        query {
                            posts {
                                title
                            }
                        }
                    `
                );

                return data.posts;
            }
        }
    }
});
```


### Does it support graphql files or graphql tag ?

---

Of Course! Wherever you need to provide `typeDefs` you can use strings, [graphql-tag](https://github.com/apollographql/graphql-tag) or file paths.

### What is the role of the gateway ?

---

Remember the initial schema & keep track of services with the corresponding names. Produce a Graphql schema after introspecting each supplied service.

> `GraphQLGateway` acts as a reverse proxy when using Inter-Schema execution.

Your gateway will;
1. Not throw if it loses connection to a service
2. Allow unlimited services, with the same name, to join the swarm
3. Load balance requests to each service
4. Not start until all services are connected
5. Ensure no other gateway has the same name but different schema

> You can spawn multiple instances of the same gateway 

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