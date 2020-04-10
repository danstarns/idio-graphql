---
id: idio-enum
title: IdioEnum
---

```javascript 
const { IdioEnum } = require("idio-graphql");
```

## Intro

---

You can use **IdioEnum** to modularize a **[`EnumTypeDefinition`](http://spec.graphql.org/June2018/#EnumTypeDefinition)**, together with its resolver. You can specify enums 'top-level' at **[combineNodes](combine-nodes)** or at an **[GraphQLNode](graphql-node)** level. 

## Example

---

```javascript
const StatusEnum = new IdioEnum({
    name: "StatusEnum",
    typeDefs: `
    enum StatusEnum {
        ONLINE
        OFFLINE
        INACTIVE
    }
    `,
    resolver: {
        ONLINE: "online",
        OFFLINE: "offline",
        INACTIVE: "inactive"
    }
});

```


## Definition

---

```typescript
/**
 * You can use IdioEnum to modularize a EnumTypeDefinition,
 * together with its resolver. You can specify enums 'top-level'
 * at combineNodes or at an GraphQLNode level.
 */
class IdioEnum {
    name: string;

    typeDefs: string;

    resolver: { [k: string]: any };

    constructor(input: {
        name: string;
        typeDefs: string | DocumentNode;
        resolver: { [k: string]: any };
    });

    serve: (brokerOptions: IdioBrokerOptions) => Promise<ServiceBroker>;
}
```
