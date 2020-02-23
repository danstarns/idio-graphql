---
id: combine-nodes
title: combineNodes
---

```javascript 
const { combineNodes } = require("idio-graphql")
```

## Intro

---

You can use **combineNodes** to snap [**GraphQLNode's**](graphql-node) & [**Schema Appliances**](schema-appliances) together into a single Schema.

## Example

---

```javascript 
const { typeDefs, resolvers, schemaDirectives } = combineNodes(
    nodes,
    {
        scalars,
        enums,
        directives,
        interfaces,
        unions,
        schemaGlobals
    }
);
```

## Definitions

---

```javascript
/**
 * @typedef RUNTIME
 * @property {object} REGISTERED_NAMES
 * @property {GraphQLSchema} schema
 * @property {string} typeDefs
 * @property {object} resolvers
 * @property {object} resolvers.Query
 * @property {object} resolvers.Mutation
 * @property {object} resolvers.Subscription
 * @property {object} schemaDirectives
 */

/**
 * You can use combineNodes to snap GraphQLNode's & Schema Appliances together into a single Schema.
 *
 * @param {GraphQLNode[]} nodes
 * @param {appliances} appliances
 * @returns {RUNTIME}
 */
```

```javascript
async function combineNodes(nodes: GraphQLNode, appliances: appliances);
```