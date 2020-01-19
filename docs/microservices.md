---
id: microservices
title: Microservices
---

## Intro

> **https://moleculer.services/**

idio-graphql builds on the foundations created by [**Moleculer**](https://moleculer.services/) & enables developer's to distribute parts of their GraphQL schema over various communication channels. idio-graphql enables developers to serve [**GraphQLNode's**](graphql-node) & selected **Schema Appliances** through a **[Service Broker](https://moleculer.services/docs/0.13/api/service-broker.html)**.

> It's recommended to read the [**previous guides**](getting-started), grasp the fundamentals of idio-graphql, before reading.


## Getting Started

idio-graphql ships with the code to work with [**Moleculer**](https://moleculer.services/) but, **Moleculer** is an optional dependency.

`npm install moleculer`

You will need to choose & launch your own [**transport layer**](https://moleculer.services/docs/0.13/networking.html), these docs will use [**NATS**](https://nats.io/). Once you have this, lets precede and serve your first Node!


## Serving Your First Node

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

async function main() {
    await User.serve({ transporter: "NATS" });

    console.log(`User service online`);
}

main();
```

## Your First Gateway
[**GraphQLGateway**](graphql-gateway) sits at the core of your services, the gateway will introspect each service specified and build a distributed GraphQL schema.


```javascript
const gateway = GraphQLGateway(
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

async function main() {
    const { typeDefs, resolvers, broker } = await gateway.start();

    console.log(`gateway service online`);
}

main();
```
On successful start, you receive resolvers that are mapped to [**Moleculer**](https://moleculer.services/) service calls.

## Utilizing The Service Broker
To harness the real power of an microservices architecture you should take advantage of the **[Service Broker](https://moleculer.services/docs/0.13/api/service-broker.html)**, initializing [**Moleculer**](https://moleculer.services/) microservices outside the bounds of GraphQL, to offload long running business logic. [**`GraphQLNode.serve()`**](graphql-node#serve) will return an **[Service Broker](https://moleculer.services/docs/0.13/api/service-broker.html)**, you also have access to an **[Service Broker](https://moleculer.services/docs/0.13/api/service-broker.html)** inside each resolver through the context parameter.


```javascript
const broker = await User.serve({ transporter: "NATS" });
```

```javascript
resolvers: { 
    Query: {
        getUser: (root, args, { broker }) => { ... }
    }
}
```

## Gradual Adoption

You may not need or want to distribute all your Nodes. You can use [**GraphQLGateway**](graphql-gateway) to gradually adopt a microservices architecure.

```javascript
const gateway = GraphQLGateway(
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

async function main() {
    const { typeDefs, resolvers, broker } = await gateway.start();

    console.log(`gateway service online`);
}

main();
```

## Preserving Parameters
[**GraphQLGateway**](graphql-gateway) will forward the GraphQL arguments onto the relevant Node. 

> Its not recommended to place large or circular objects in the `root` & or the `context` parameters. Due to the implications/stress it can have on the chosen transport layer. 


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

async function main() {
    await User.serve({ transporter: "NATS" });

    console.log(`User service online`);
}

main();
```


```javascript
const gateway = GraphQLGateway(
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

async function main() {
    const { typeDefs, resolvers, broker } = await gateway.start();


    const apolloServer = new ApolloServer({
        typeDefs, 
        resolvers,
        context: () => {
            return {
                abc: "123"
            }
        }
    });

    ...
}

main();
```

## Subscriptions
GraphQL Subscriptions through your chosen transport layer will work out the box with [**GraphQLNode's**](graphql-node). Ensure you return an async iterator from your `subscribe` method! 

> When utilizing Subscriptions you should prefer a native streaming implementation, such as [**NATS Streaming**](https://moleculer.services/docs/0.13/networking.html#NATS-Streaming-STAN-Transporter), for your transport layer.


## Schema Appliances 
[**GraphQLGateway**](graphql-gateway) supports [**Schema Appliances**](schema-appliances). 

```javascript
const gateway = GraphQLGateway(
    {
        services: { ... },
        locals: {
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