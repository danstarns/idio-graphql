---
id: resolver-hooks
title: Resolver Hooks
---

## Intro

---

Sometimes you might need to run function(s), `pre` or `post` your resolver. You could use **[Schema Directives](schema-appliances#directives)** with **[IdioDirectives](idio-directive)**. Resolver hooks allow you to achieve similar heights.

> Hooks are available on any **[GraphQLNode](graphql-node)** or **[GraphQLType](graphql-type)**  resolver  **exempt from Subscriptions**.


<!--DOCUSAURUS_CODE_TABS-->

<!--GraphQLNode-->
```js
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
<!--GraphQLType-->
```js
new GraphQLType({
    name: "Metadata",
    typeDefs: gql`
        type Metadata {
            lastLogin: String
        }
    `,
    resolvers: {
        lastLogin: {
            pre: isRequestAdmin,
            resolve: () => { ... },
            post: updateAudit
        }
    }
})
```

<!--END_DOCUSAURUS_CODE_TABS-->


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

```typescript
type PreHook = (
    root: any,
    args: { [k: string]: any },
    context: Context,
    info: DocumentNode
) => void;
```

## Resolve Hook

---

```typescript
type Resolve = (
    root: any,
    args: { [k: string]: any },
    context: Context,
    info: DocumentNode
) => void;
```

## Post Hook

---

```typescript
type PostHook = (
    resolve: any,
    root: any,
    args: { [k: string]: any },
    context: Context,
    info: DocumentNode
) => void;
```