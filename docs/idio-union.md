---
id: idio-union
title: IdioUnion
---

```javascript 
const { IdioUnion } = require("idio-graphql");
```

## Intro

---

You can use **IdioUnion** to modularize a **[`UnionTypeDefinition`](http://spec.graphql.org/June2018/#UnionTypeDefinition)**,
together with its resolver. You can specify unions 'top-level' at **[combineNodes](combine-nodes)** or at an **[GraphQLNode](graphql-node)** level.

## Example

---

```javascript
const AOrB = new IdioUnion({
    name: "AOrB",
    typeDefs: `union AOrB = A | B`,
    resolver: {
        __resolveType() {
            const x = ["A", "B"];

            return x[Math.ceil(Math.random())];
        }
    }
});
```


## Definition

---

```typescript
/**
 * You can use IdioUnion to modularize a UnionTypeDefinition,
 * together with its resolver. You can specify unions 'top-level'
 * at combineNodes or at an GraphQLNode level.
 */
class IdioUnion {
    name: string;

    typeDefs: string;

    resolver: {
        __resolveType: ResolveType;
    };

    constructor(input: {
        name: string;
        typeDefs: string | DocumentNode;
        resolver: {
            __resolveType: ResolveType;
        };
    });

    serve: (brokerOptions: IdioBrokerOptions) => Promise<ServiceBroker>;
}
```

