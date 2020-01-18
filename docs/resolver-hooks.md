---
id: resolver-hooks
title: Resolver Hooks
---

Sometimes you might need to run function(s), `pre` or `post` your resolver. You could use **[Schema Directives](schema-appliances#directives)** with **[IdioDirectives](idio-directive)**
for this. Resolver hooks allow you to achieve similar heights.

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
An array of functions that will be resolved sequentiality. 

```javascript
Query: {
    users: {
        pre: [isRequestAdmin, canRequest(view("users"))],
        resolve: () => { ... }
    }
}
```

## Async hooks
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

## pre
```javascript
/**
 * @function PreHook
 * @param {any}    root - The GraphQl root argument.
 * @param {Object} args - The GraphQl args argument.
 * @param {Object} context - The GraphQl context argument.
 * @param {Object} info - The GraphQl info argument.
 */
```

## post
```javascript
/**
 * @function PostHook
 * @param {any}    resolve - The outcome of the resolve method.
 * @param {any}    root - The GraphQl root argument.
 * @param {Object} args - The GraphQl args argument.
 * @param {Object} context - The GraphQl context argument.
 * @param {Object} info - The GraphQl info argument.
 */

```