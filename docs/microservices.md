---
id: microservices
title: Microservices
---

## Intro

---

> **https://moleculer.services/**

idio-graphql builds on the foundations created by [**Moleculer.js**](https://moleculer.services/) & enables developer's to distribute parts of a GraphQL schema over various communication channels. Such integration enables developers to serve [**GraphQLNode's**](graphql-node) & selected **Schema Appliances** through a **[Service Broker](https://moleculer.services/docs/0.13/api/service-broker.html)**.

> It's recommended to read the [**previous guides**](getting-started), grasp the fundamentals of idio-graphql, before reading.


## Getting Started

---

[**Moleculer**](https://moleculer.services/) it is an optional dependency.

`npm install moleculer`

> You will need to choose & launch your own [**transport layer**](https://moleculer.services/docs/0.13/networking.html), these docs will use [**NATS**](https://nats.io/). 

## Serving Your First Node

---

```javascript
const User = new GraphQLNode({
    name: "User",
    typeDefs: `
        type User {
            name: String
            age: String
        }

        type Query {
            getUser: User
        }
    `,
    resolvers: { 
        Query: {
            getUser: () => { ... }
        }
    }
});

await User.serve({ transporter: "NATS" });
```

## Your First Gateway

---

[**GraphQLGateway**](graphql-gateway) sits at the core of your services, the gateway will introspect each service specified and build a distributed GraphQL schema.


```javascript
const gateway = new GraphQLGateway(
    {
        services: { 
            nodes: [ "User" ]
        }
    },
    {
        transporter: "NATS",
        nodeID: "gateway"
    }
);

const { typeDefs, resolvers, broker } = await gateway.start();
```
On successful start, you receive merged typeDefs & resolvers, that are mapped to [**Moleculer**](https://moleculer.services/) service calls.


## Gradual Adoption

---

You may not need or want to distribute all your Nodes. You can use [**GraphQLGateway**](graphql-gateway) to gradually adopt a microservices architecure.

```javascript
const gateway = new GraphQLGateway(
    {
        services: { 
            nodes: [ "User" ]
        },
        locals: {
            nodes: [ PostNode ]
        }
    },
    {
        transporter: "NATS",
        nodeID: "gateway"
    }
);
```

## Service Broker

---

To harness the real power of a microservices architecture you should take advantage of the **[Service Broker](https://moleculer.services/docs/0.13/api/service-broker.html)**, initializing [**Moleculer**](https://moleculer.services/) microservices outside the bounds of GraphQL, to offload long running business logic. [**`GraphQLNode.serve()`**](graphql-node#serve) will return a **[Service Broker](https://moleculer.services/docs/0.13/api/service-broker.html)**, you also have access to a **[Service Broker](https://moleculer.services/docs/0.13/api/service-broker.html)** inside each resolver through the `context.injections` parameter.


```javascript
const broker = await User.serve({ transporter: "NATS" });
```

```javascript
resolvers: { 
    Query: {
        getUser: (root, args, { injections: { broker } }) => { ... }
    }
}
```

> 'Local Services' are initialized as a **[Service Broker](https://moleculer.services/docs/0.13/api/service-broker.html)**.

## Scaling 

---

idio-graphql comes with 'effort-less' scaling. 

## Preserving Parameters

---

[**GraphQLGateway**](graphql-gateway) will forward the GraphQL arguments onto the relevant Node. 

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
            getUser: (root, args, { abc }) => { 
                abc // 123
                ...
             }
        }
    }
});
```


```javascript
const gateway = new GraphQLGateway(
    {
        services: { 
            nodes: [ "User" ]
        }
    },
    ...
);

const { typeDefs, resolvers } = await gateway.start();

const apolloServer = new ApolloServer({
    typeDefs, 
    resolvers,
    context: () => {
        return {
            abc: "123"
        }
    }
});
```

## Subscriptions

--- 

GraphQL Subscriptions, through your chosen transport layer, will work out the box with [**GraphQLNode's**](graphql-node). Ensure you return an async iterator from your `subscribe` method! 

> When utilizing Subscriptions you should prefer a native streaming implementation, such as [**NATS Streaming**](https://moleculer.services/docs/0.13/networking.html#NATS-Streaming-STAN-Transporter), for your transport layer.


## Schema Appliances 

---

[**GraphQLGateway**](graphql-gateway) supports [**Schema Appliances**](schema-appliances). 

```javascript
const gateway = new GraphQLGateway(
    {
        services: { ... },
        locals: {
            nodes,
            enums, 
            scalars, 
            directives, 
            interfaces,
            unions,
            schemaGlobals
        }
    },
    {
        transporter: "NATS",
        nodeID: "gateway"
    }
);
```