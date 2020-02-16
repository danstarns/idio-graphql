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
            unions
        },
        locals: { 
            nodes,
            enums,
            scalars,
            directives,
            interfaces,
            unions,
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
 */

/**
 * @typedef locals
 * @property {GraphQLNode[]} nodes
 * @property {IdioEnum[]} enums
 * @property {IdioScalar[]} scalars
 * @property {IdioDirective[]} directives
 * @property {IdioInterface[]} interfaces
 * @property {IdioUnion[]} unions
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

1. [**serve**](#serve)

### Serve 

---

> **https://moleculer.services/docs/0.12/broker.html**

#### Example
```javascript
const { typeDefs, resolvers, schemaDirectives, broker } = await gateway.start();
```

#### Definitions
```javascript
/**
 * @function start
 * @returns {() => Promise.<Schema>}
*/
```

```javascript
async function start();
```