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

await User.serve({ 
    transporter: "NATS",
    gateway: "gateway"
});
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


<!--DOCUSAURUS_CODE_TABS-->
<!--Gateway-->

```js
const Post = require("./Post.js");

const gateway = new GraphQLGateway(
    {
        services: { 
            nodes: [ "User" ]
        },
        locals: {
            nodes: [ Post ]
        }
    },
    {
        transporter: "NATS",
        nodeID: "gateway"
    }
);

const { typeDefs, resolvers } = await gateway.start();
```
<!--User-->
```js
const User = new GraphQLNode({
    name: "User",
    typeDefs: "...",
    resolvers: { ... }
});

await User.serve({
    gateway: "gateway",
    transporter: "NATS"
});
```

<!--Post-->
```js
const Post = new GraphQLNode({
    name: "Post",
    typeDefs: "...",
    resolvers: { ... }
});

module.exports = Post;
```
<!--END_DOCUSAURUS_CODE_TABS-->

## Service Broker

---

To harness the real power of microservices you should take advantage of the **[Service Broker](https://moleculer.services/docs/0.13/api/service-broker.html)**, initializing [**Moleculer**](https://moleculer.services/) microservices outside the bounds of GraphQL, to offload long running business logic. [**`GraphQLNode.serve()`**](graphql-node#serve) will return a **[Service Broker](https://moleculer.services/docs/0.13/api/service-broker.html)**, you also have access to a **[Service Broker](https://moleculer.services/docs/0.13/api/service-broker.html)** inside each resolver through the `context.injections` parameter.


```javascript
const { broker } = await User.serve({ transporter: "NATS" });
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

idio-graphql comes with 'effort-less' scaling. You can horizontally scale all idio-graphql services & let the package handle the load balancing.

### Load Balancing

---

Taking advantage of **[`$node.list`](https://moleculer.services/docs/0.13/services.html#Internal-services)**  your idio-graphql service will keep track of the active nodes, gateways and schema appliances & deliver messages bases on a pseudo-random algorithm.

### Heartbeat Interval

---

The in-memory active node list will be refreshed based on the **[Moleculer](https://moleculer.services/docs/0.14/configuration.html#Broker-options)** `heartbeatInterval` provided at either `serve` or `start` of a service. Its recommended to experiment with this interval, to achieve maximum reliability, based on the constrains within your distributed system.

> View all the broker options **[here](https://moleculer.services/docs/0.14/configuration.html#Broker-options)**

```javascript
const gateway = new GraphQLGateway(
    { services: { nodes: ["User"] } },
    {
        transporter: "NATS",
        nodeID: "gateway",
        heartbeatInterval: 3 // seconds
    }
);
```

```javascript
await UserNode.serve({
    gateway: "gateway",
    transporter: "NATS",
    heartbeatInterval: 3
});
```
### Duplicate Services

---

For the load balancing to be able to deliver messages to only one instance of each node,
each service is set up to be unique by its nodeID.

> Service ID's adhere to the following schema **`<NAME>:<GATEWAY>:<UUID>`**


```javascript
const gateway = new GraphQLGateway(
    { services: { nodes: ["User"] } },
    {
        transporter: "NATS",
        nodeID: "gateway",
        heartbeatInterval: 3 // seconds
    }
);

const { broker } = await gateway.start();

broker.options.nodeID // "gateway:gateway:uuid123"
```

```javascript
const { broker } = await UserNode.serve({
    gateway: "gateway",
    transporter: "NATS",
    heartbeatInterval: 3
});

broker.options.nodeID // "User:gateway:uuid123"
```

## Preserving Parameters

---



[**GraphQLGateway**](graphql-gateway) will forward the GraphQL arguments onto the relevant Node. 

> Arguments passed between services will be sanitized using **[`safe-json-stringify`](https://www.npmjs.com/package/safe-json-stringify)**

<!--DOCUSAURUS_CODE_TABS-->
<!--Gateway-->

```js
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
<!--User Service-->
```js
const User = new GraphQLNode({
    name: "User",
    typeDefs: "...",
    resolvers: { 
        Query: {
            getUser: (root, args, { abc }) => { 
                abc // 123
             }
        }
    }
});
```
<!--END_DOCUSAURUS_CODE_TABS-->

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