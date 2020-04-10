---
id: idio-interface
title: IdioInterface
---

```javascript 
const { IdioInterface } = require("idio-graphql");
```

## Intro

---

You can use **IdioInterface** to modularize a **[`InterfaceTypeDefinition`](http://spec.graphql.org/June2018/#InterfaceTypeDefinition)**, together with its resolver. You can specify interfaces 'top-level' at **[combineNodes](combine-nodes)** or at an **[GraphQLNode](graphql-node)** level.

## Example

---

```javascript
const ErrorInterFace = new IdioInterface({
    name: "ErrorInterface",
    typeDefs: `
    interface ErrorInterface {
        message: String
        code: Int
    }`,
    resolver: {
        __resolveType(obj) {
            if (obj.req) {
                return "HTTP";
            }
        }
    }
});
```


## Definition

---

```typescript
/**
 * You can use IdioInterface to modularize a InterfaceTypeDefinition,
 * together with its resolver. You can specify interfaces 'top-level'
 * at combineNodes or at an GraphQLNode level.
 */
class IdioInterface {
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

