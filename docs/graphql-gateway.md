---
id: graphql-gateway
title: GraphQLGateway
---

```javascript
const { GraphQLGateway } = require("idio-graphql");
```

## Intro

---

You can use  **GraphQLGateway** to orchestrate a collection of [**GraphQLNode's**](graphql-node) & [**Schema Appliances**](schema-appliances) exposed over a network.

## Example

---

```javascript
const gateway = new GraphQLGateway(
    {
        services: { 
            nodes,
            enums,
            interfaces,
            unions,
            types
        },
        locals: { 
            nodes,
            enums,
            scalars,
            directives,
            interfaces,
            unions,
            types,
            schemaGlobals
         }
    },
    {
        transporter: "NATS",
        nodeID: "gateway"
    }
);
```

## Definition

---

```typescript
interface Locals {
    nodes?: GraphQLNode[];
    enums?: IdioEnum[];
    interfaces?: IdioInterface[];
    unions?: IdioUnion[];
    types?: GraphQLType[];
    scalars?: IdioScalar[];
    directives?: IdioDirective[];
    schemaGlobals?: string | string[] | DocumentNode | DocumentNode[];
}

interface Services {
    nodes?: string[];
    enums?: string[];
    interfaces?: string[];
    unions?: string[];
    types?: string[];
}

/**
 * You can use GraphQLGateway to orchestrate a collection of GraphQLNode's
 * & Schema Appliances exposed over a network.
 */
class GraphQLGateway {
    broker: ServiceBroker;

    constructor(
        config: { services?: Services; locals?: Locals },
        brokerOptions: BrokerOptions
    );
    
    start: () => Promise<{
        schema: GraphQLSchema;
        typeDefs: string;
        resolvers: { [k: string]: any };
        schemaDirectives?: { [k: string]: any };
        execute: InterSchemaExecute;
        broker: ServiceBroker;
    }>;
}
```

