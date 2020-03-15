---
id: creating-nodes
title: Creating Nodes
---

## Intro

---

A "Node" **[GraphQLNode](graphql-node)** is designed to encapsulate a **[`ObjectTypeDefinition`](http://spec.graphql.org/June2018/#ObjectTypeDefinition)** together with its related resolvers & properties. Lets create a `User` Node.

```javascript
const User = new GraphQLNode({
    name: "User"
});
```

## TypeDefs

---

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

---

A Node allows you to specify the following resolvers;

1. `Query`
2. `Mutation`
3. `Subscription`
4. `Fields`

Let's implement the `getUser` resolver...


<!--DOCUSAURUS_CODE_TABS-->
<!--Query-->
```js
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
<!--Mutation-->
```js
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
<!--Fields-->
```js
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
<!--Subscription-->

> Subscriptions must return a 'subscribe' property that resolves to an async iterator!

```js
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
<!--END_DOCUSAURUS_CODE_TABS-->



## Injections

---

It's recommended to inject dependencies into your Node, this helps with testing. For each resolver injections will be a property on the `context` parameter.

```javascript
new GraphQLNode({
    injections: { ... }
})
```

```javascript
const User = new GraphQLNode({
    name: "User",
    typeDefs: "./User.gql",
    injections: {
        UserModel
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

## Nodes

---

You can recursively nest nodes to reflect domains & work with architectural constraints.


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

## Enums

---

You can encapsulate enums within a Node. Checkout the **[Schema Appliances](schema-appliances)** guide and the API for **[IdioEnum](idio-enum)**.

```javascript
const StatusEnum = new IdioEnum({
    name: "StatusEnum",
    ...
});


const User = new GraphQLNode({
    name: "User",
    enums: [ StatusEnum ],
    ...
});
```
## Interfaces

---

You can encapsulate interfaces within a Node. Checkout the **[Schema Appliances](schema-appliances)** guide and the API for **[IdioInterface](idio-interface)**.

```javascript
const PersonInterface = new IdioInterface({
    name: "PersonInterface",
    ...
});


const User = new GraphQLNode({
    name: "User",
    interfaces: [ PersonInterface ],
    ...
});
```

## Unions

---

You can encapsulate unions within a Node. Checkout the **[Schema Appliances](schema-appliances)** guide and the API for **[IdioUnion](idio-union)**.

```javascript
const UserUnion = new IdioUnion({
    name: "UserUnion",
    ...
});


const User = new GraphQLNode({
    name: "User",
    unions: [ UserUnion ],
    ...
});
```

## Types

---

You can encapsulate types within a Node. Checkout the **[Schema Appliances](schema-appliances)** guide and the API for **[GraphQLType](graphql-type)**.

```javascript
const Metadata = new GraphQLType({
    name: "Metadata",
    typeDefs: `
        type Metadata {
            lastLogin: String
        }
    `,
    resolvers: {
        lastLogin: () => { ... }
    }
});


const User = new GraphQLNode({
    name: "User",
    types: [ Metadata ],
    ...
});
```
