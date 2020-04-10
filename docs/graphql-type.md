---
id: graphql-type
title: GraphQLType
---

```javascript 
const { GraphQLType } = require("idio-graphql");
```

## Intro

---

You can use GraphQLType to modularize a **[ObjectTypeDefinition](http://spec.graphql.org/June2018/#ObjectTypeDefinition)**, together with its Field resolvers.

## Example

---


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
```

## Definition

---

```typescript
/**
 * You can use GraphQLType to modularize a ObjectTypeDefinition,
 * together with its Field resolvers. You can specify types 'top-level'
 * at combineNodes or at an GraphQLNode level.
 */
class GraphQLType {
    name: string;

    typeDefs: string;

    resolvers: { [k: string]: ResolverUnion };

    injections?: { [k: string]: any };

    constructor(input: {
        name: string;
        typeDefs: string | DocumentNode;
        resolvers: { [k: string]: ResolverUnion };
        injections?: { [k: string]: any };
    });

    serve: (brokerOptions: IdioBrokerOptions) => Promise<ServiceBroker>;
}
```
