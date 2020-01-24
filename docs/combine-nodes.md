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
const { typeDefs, resolvers, schemaDirectives } = await combineNodes(
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
 * @typedef {Object} Schema
 * @property {string} typeDefs
 * @property {Object} resolvers
 * @property {Object} resolvers.Query
 * @property {Object} resolvers.Mutation
 * @property {Object} resolvers.Subscription
 * @property {Object} schemaDirectives
 */

/**
 * @typedef {Object} appliances
 * @property {Array.<IdioScalar>} scalars
 * @property {Array.<IdioEnum>} enums
 * @property {Array.<IdioDirective>} directives
 * @property {Array.<IdioInterface>} interfaces
 * @property {Array.<IdioUnion>} unions
 * @property {any} schemaGlobals - an Array or a single instance of Graphql typeDefs, use filePath, string, or gql-tag.
 */

/**
 * combineNodes will combine, GraphQLNode's, Schema Appliances & return typeDefs, resolvers, schemaDirectives.
 * Ready to be passed to your favorite GraphQL implementation.
 *
 * @param {Array.<GraphQLNode>} nodes
 * @param {appliances} appliances
 * @returns {Schema}
 */
```

```javascript
async function combineNodes(nodes: GraphQLNode, appliances: appliances);
```