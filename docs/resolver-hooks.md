---
id: resolver-hooks
title: Resolver Hooks
---

## Intro

---

Sometimes you might need to run function(s), `pre` or `post` your resolver. You could use **[Schema Directives](schema-appliances#directives)** with **[IdioDirectives](idio-directive)**. Resolver hooks allow you to achieve similar heights.

> Hooks are available on any **[GraphQLNode](graphql-node)** resolver  **exempt from Subscriptions**.

```javascript
new GraphQLNode({
    name: "User",
    typeDefs: gql`
        type User {
            name: String
        }

        type Query {
            users: User
        }
    `,
    resolvers: {
        Query: {
            users: {
                pre: isRequestAdmin,
                resolve: () => { ... },
                post: updateAudit
            }
        }
    }
})
```

## Multiple hooks

---

An array of functions to be resolved sequentiality. 

```javascript
Query: {
    users: {
        pre: [isRequestAdmin, canRequest(view("users"))],
        resolve: () => { ... }
    }
}
```

## Async hooks

---

```javascript
Query: {
    users: {
        resolve: () => { ... },
        post: async (result) => {
            await updateAudit(result)
        }
    }
}
```

## Pre Hook

---

```javascript
/**
 * @typedef {(
 *      root: any,
 *      args: object,
 *      context: context,
 *      info: DocumentNode
 *   ) => any} PreHook
 */
```

## Resolve Hook

---

```javascript
/**
 * @typedef {(
 *      root: any,
 *      args: object,
 *      context: context,
 *      info: DocumentNode
 *   ) => any} resolve
 */
```

## Post Hook

---

```javascript
/**
 * @typedef {(
 *      resolve: any,
 *      root: any,
 *      args: object,
 *      context: context,
 *      info: DocumentNode
 *   ) => any} PostHook
 */
```