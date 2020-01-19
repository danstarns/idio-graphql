---
id: creating-nodes
title: Creating Nodes
---

## Intro

A "Node" **[GraphQLNode](graphql-node)** is designed to encapsulate a **[`ObjectTypeDefinition`](http://spec.graphql.org/June2018/#ObjectTypeDefinition)** together with its related resolvers & properties. Lets create a `User` Node.

```javascript
const { GraphQLNode } = require("idio-graphql");

const User = new GraphQLNode({
    name: "User"
});
```

## TypeDefs
Here is the **[`Schema Definition Language (SDL)`](http://spec.graphql.org/June2018/#sec-Language)** for our Node.

```graphql
type User {
    name: String
    age: Int
}

type Query {
    getUser: User
}
```

SDL can be referred to as `typeDefs`. 

> You can use filePaths, strings & even an **[AST](https://github.com/apollographql/graphql-tag)** when specifying `typeDefs`.

```javascript
const User = new GraphQLNode({
    name: "User",
    typeDefs: `
        type User {
            name: String
            age: Int
        }

        type Query {
            getUser: User
        }
    `
});
```

## Resolvers
A Node allows you to specify the following resolvers;

1. `Query`
2. `Mutation`
3. `Subscription`
4. `Fields`

Let's implement the `Query` resolver, called `getUser`, defined in our `typeDefs`.

### Query

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

### Mutation
```javascript
{
    typeDefs: `
        type User ...

        type Mutation {
            likeUser: User
        }
    `,
    resolvers: {
        Mutation: {
           likeUser: (root, args, ctx) => { ... }
        }
    }
}
```
### Fields

```javascript
{
    typeDefs: `
        type User {
            name: String
            posts: [Post]
        }

        ...
    `,
    resolvers: {
        Fields: {
            posts: (root, args, ctx) => { ... }
        }
    }
}
```

### Subscription
> Subscriptions must return a 'subscribe' property that resolves to an async iterator!

```javascript
{
    typeDefs: `
        type User ...

        type Subscription {
            userUpdate: User
        }
    `,
    resolvers: {
        Subscription: {
            userUpdate: {
                subscribe: (root, args, ctx) => asyncIterator()
            }
        }
    }
}
```

## Injections
It's recommended to inject dependencies into your Node, this helps with testing. Most GraphQL implementations work on the concept of `context`. For each resolver injections will be a scoped property on `context`.

Injections can either be a value or a function.

```javascript
new GraphQLNode({
    injections: { ... }
})
```

```javascript
new GraphQLNode({
    injections: async () => { ... }
})
```

```javascript
const UserModel = require(...);

const User = new GraphQLNode({
    name: "User",
    typeDefs: "./User.gql",
    injections: () => {
        return {
            UserModel
        }
    },
    resolvers: {
        Query: {
            getUser: (root, args, context) => {
                return context.injections.UserModel.findOne()
            }
        }
    }
});
```

## Enums
You can encapsulate enums within a Node. Checkout the **[Schema Appliances](schema-appliances)** guide and the API for **[IdioEnum](idio-enum)**.

```javascript
const StatusEnum = new IdioEnum({
    name: "StatusEnum",
    typeDefs: `
        enum StatusEnum {
            ONLINE
            OFFLINE
            INACTIVE
        }
    `,
    resolver: {
        ONLINE: "online",
        OFFLINE: "offline",
        INACTIVE: "inactive"
    }
});


const User = new GraphQLNode({
    name: "User",
    typeDefs: `
        type User {
            name: String
            age: Int
            status: StatusEnum
        }

        ...
    `,
    resolvers: { ... },
    enums: [ StatusEnum ]
});
```

## Unions
You can encapsulate unions within a Node. Checkout the **[Schema Appliances](schema-appliances)** guide and the API for **[IdioUnion](idio-union)**.

```javascript
const AOrB = new IdioUnion({
    name: "AOrB",
    typeDefs: `union AOrB = A | B`,
    resolver: {
        __resolveType() {
            const x = ["A", "B"];

            return x[Math.ceil(Math.random())];
        }
    }
});


const User = new GraphQLNode({
    name: "User",
    typeDefs: `
        type User {
            name: String
            age: Int
            letter: AOrB
        }

        ...
    `,
    resolvers: { ... },
    unions: [ AOrB ]
});
```

## Nodes
You can recursively nest nodes to reflect domains & work with architectural constraints.


```javascript
const Comment = new GraphQLNode({
    name: "Comment",
    typeDefs: gql`
        type Comment {
            content: String
            user: User
        }

        ...
    `,
    resolvers: { ... }
});

const Post = new GraphQLNode({
    name: "Post",
    typeDefs: gql`
        type Post {
            title: String
            content: String
            comments: [Comment]
        }

        ...
    `,
    resolvers: { ... },
    nodes: [ Comment ]
});

const User = new GraphQLNode({
    name: "User",
    typeDefs: gql`
         type User {
            name: String
            age: Int
            posts: [Post]
        }

        ...
    `,
    resolvers: { ... },
    nodes: [ Post ]
});
```
