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
 * @function PreHook
 * @param {any}    root
 * @param {Object} args 
 * @param {Object} context 
 * @param {Object} info 
 */
```

## Resolve Hook

---

```javascript
/**
 * @function PreHook
 * @param {any}    root
 * @param {Object} args 
 * @param {Object} context 
 * @param {Object} info 
 */
```

## Post Hook

---

```javascript
/**
 * @function PostHook
 * @param {any}    resolve - The outcome of the resolve method.
 * @param {any}    root 
 * @param {Object} args 
 * @param {Object} context 
 * @param {Object} info 
 */
```