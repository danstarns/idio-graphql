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

## Definitions

---

```javascript
/**
 * @typedef services
 * @property {string[]} nodes
 * @property {string[]} enums
 * @property {string[]} interfaces
 * @property {string[]} unions
 * @property {string[]} types
 */

/**
 * @typedef locals
 * @property {GraphQLNode[]} nodes
 * @property {IdioEnum[]} enums
 * @property {IdioScalar[]} scalars
 * @property {IdioDirective[]} directives
 * @property {IdioInterface[]} interfaces
 * @property {IdioUnion[]} unions
 * @property {GraphQLType[]} types
 * @property {(string | DocumentNode | string[] | DocumentNode[])} schemaGlobals
 */

/**
 * @typedef GraphQLGateway
 * @property {() => Promise<Runtime>} start
 * @property {ServiceBroker} broker
 */

/**
 * @typedef GraphQLGatewayConfig
 * @property {services} services
 * @property {locals} locals
 */

/**
 *
 * You can use GraphQLGateway to orchestrate a collection of GraphQLNode's & Schema Appliances exposed over a network.
 *
 * @param {GraphQLGatewayConfig} config
 * @param {BrokerOptions} brokerOptions
 *
 * @returns {GraphQLGateway}
 */
```

```javascript
new function GraphQLGateway(config: config, brokerOptions: BrokerOptions);
```

## Methods 

---

1. [**start**](#start)

### Start 

---

> **https://moleculer.services/docs/0.12/broker.html**

#### Example
```javascript
const { typeDefs, resolvers, schemaDirectives, broker } = await gateway.start();
```

#### Definitions
```javascript
/**
 * @typedef Runtime
 * @property {GraphQLGatewayConfig["locals"]} locals
 * @property {GraphQLGatewayConfig["services"]} services
 * @property {RegisteredServices} registeredServices
 * @property {GraphQLGatewayConfig["services"]} waitingServices
 * @property {Object<string, ServiceManager>} serviceManagers
 * @property {string} typeDefs
 * @property {object} resolvers
 * @property {object} resolvers.Query
 * @property {object} resolvers.Mutation
 * @property {object} resolvers.Subscription
 * @property {object} schemaDirectives
 * @property {ServiceBroker} broker
 * @property {GraphQLSchema} schema
 * @property {execute} execute
 */

/**
 * @function start
 * @returns {() => Promise<Runtime>}
*/
```

```javascript
async function start();
```