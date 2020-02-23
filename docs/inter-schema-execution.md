---
id: inter-schema-execution
title: Inter-Schema Execution
---

## Intro

---

GraphQL allows engineers to query and define resolvers for complex relationships within a data set. idio-graphql enables the ability to, at runtime, execute a `Query/Mutation`, otherwise known as a **[Document](https://spec.graphql.org/June2018/#sec-Language.Document)**, against the parent and or a specified specified schema, using custom directives. In this guide you will be shown how to utilize the `execute` method, available for both local nodes and service nodes. You will learn how to re-use code simontainsly populating edges in your graph.

> Subscriptions are not supported with Inter-Schema Execution.

## Dissecting Resolvers

---


Before we dive deeper into the `execute` method we need to take a moment, to reflect on what our resolver functions look like.

```javascript
/**
 * @typedef {{injections: {execute: execute, broker?: ServiceBroker}}} context
 */

/**
 * @typedef {(
 *      root: any,
 *      args: object,
 *      context: context,
 *      info: DocumentNode
 *   ) => any} resolve
 */
```
Armed with this knowledge we are now prepared to preform our first Inter-Schema execution.

## Defining Relationships

---

In order to achieve our goal _"re-use code simontainsly populating edges in your graph"_ we need to first establish a data set where a relationship is present.

```graphql
type User {
    id: ID
    name: String
    posts: [Post]
}

type Post {
    id: ID
    title: String
}
```

We will use this schema to demonstrate the capability's of Inter-Schema Execution.

## Creating Nodes

---

> Checkout the **[Creating Nodes](creating-nodes)** guide for more information about creating nodes.

### User

---

```javascript
const User = new GraphQLNode({
    name: "User",
    typeDefs: gql`
        type User {
            id: ID
            name: String
            posts: [Post]
        }

        type Query {
            user(id: ID!): User
            users(ids: [ID]): [User]
        }
    `,
    resolvers: {
        Query: {
            user: (root, { id }) => { ... },
            users: (root, { ids }) => { ... }
        },
        Fields: {
            posts: (root, args, { injections }) => { ... }
        }
    }
});
```

### Post

---

```javascript
const Post = new GraphQLNode({
    name: "Post",
    typeDefs: gql`
        type Post {
            id: String
            title: String
        }

        type Query {
            posts(ids: [ID]): [Post]
        }
    `,
    resolvers: {
        Query: {
            posts: (root, { ids }) => { ... }
        }
    }
});
```

## Field Resolvers

---

Now we have created our nodes, we need to focus on the field resolvers for both `User` & `Post` types. This is where we define the logic for populating edges in our graph. 

```graphql
type User {
    posts: [Post] ## field resolver
}
```

You may have established that we already have a query available for `posts(ids: [String]): [Post]` and could be re-used to populate `User.posts`. This is the aim of the `execute` method, to expose the ability to re-use operations.

## Execute
You can use this method to preform a `Query/Mutation` against a specified schema.

> Subscriptions are not supported with interservice schema execution.

```javascript
/**
 * @typedef ExecutionContext
 * @property {object} root
 * @property {object} context
 * @property {object} variables
 * @property {string} operationName
 */

/**
 * @typedef {(
 *      document: (DocumentNode | string),
 *      executionContext: ExecutionContext
 *   ) => Promise<ExecutionResult>
 * } execute
 */
```

```javascript
const User = new GraphQLNode({
    name: "User",
    typeDefs: gql`
        type User {
            id: ID
            name: String
            posts: [Post]
        }

        type Query { ... }
    `,
    resolvers: {
        Query: { ... },
        Fields: {
            posts: (root, args, { injections }) => {
                const { data } = await injections.execute(
                    gql`
                        query($ids: [ID]) {
                            posts(ids: $ids) {
                                id
                                title
                            }
                        }
                    `,
                    {
                        variables: root.posts
                    }
                );

                return data.posts
            }
        }
    }
});
```
> You can also use [**graphql-tag**](https://github.com/apollographql/graphql-tag) when providing the document.

### Error Handling

`execute` returns `ExecutionResult`

```typescript
interface ExecutionResult<TData = ExecutionResultDataDefault> {
  errors?: ReadonlyArray<GraphQLError>;
  data?: TData | null;
}
```

This means that your errors will be under `response.errors`

> Usually you will only have 1 error, its fine to throw the first & ignore or log the rest.

```javascript
Fields: {
    posts: (root, args, { injections }) => {
        const { errors } = await injections.execute(
            `
                query($ids: [ID]) {
                    posts(ids: $ids) {
                        id
                        title
                    }
                }
            `,
            {
                variables: root.posts
            }
        );

        if (errors.length) {
            throw new Error(errors[0].message)
        }
    }
}
```

### Executions On Different Gateways

---

> Only available if your schema is compiled from `GraphQLGateway`

By default, your execute query will be sent to the specified gateway. It could be useful to execute a query against another gateway on the network.
To achieve this you can use the `@gateway` directive.

```graphql
directive @gateway(
  name: String!
) on QUERY | MUTATION 
```

> Make sure you provide an operation name.

```graphql
query @gateway(name: "gateway-01") {
    metadata: getMetaData {
        title
        content
    }
}
```
