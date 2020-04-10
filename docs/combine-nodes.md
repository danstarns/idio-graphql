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
        types,
        schemaGlobals
    }
);
```

## Definition

---

```typescript
interface Appliances {
    nodes?: GraphQLNode[];
    enums?: IdioEnum[];
    interfaces?: IdioInterface[];
    unions?: IdioUnion[];
    types?: GraphQLType[];
    scalars?: IdioScalar[];
    directives?: IdioDirective[];
    schemaGlobals?: string | string[] | DocumentNode | DocumentNode[];
}

/**
 * You can use combineNodes to snap GraphQLNode's &
 * Schema Appliances together into a single Schema.
 */
function combineNodes(
    nodes: GraphQLNode[],
    appliances?: Appliances
): {
    schema: GraphQLSchema;
    typeDefs: string;
    resolvers: { [k: string]: any };
    schemaDirectives?: { [k: string]: any };
    execute: InterSchemaExecute;
};
```
