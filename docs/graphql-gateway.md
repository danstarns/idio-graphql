---
id: graphql-gateway
title: GraphQLGateway
---

```javascript
const { GraphQLGateway } = require("idio-graphql");
```

## Intro
You can use  **GraphQLGateway** to orchestrate a collection of [**GraphQLNode's**](graphql-node) & [**Schema Appliances**](schema-appliances) exposed over a network.

## Example
```javascript
const gateway = GraphQLGateway(
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

```javascript
/**
 * @typedef services
 * @property {Array.<string>} nodes
 * @property {Array.<string>} enums
 * @property {Array.<string>} interfaces
 * @property {Array.<string>} unions
 *
 *
 * @typedef locals
 * @property {Array.<GraphQLNode>} nodes
 * @property {Array.<IdioEnum>} enums
 * @property {Array.<IdioScalar>} scalars
 * @property {Array.<IdioDirective>} directives
 * @property {Array.<IdioInterface>} interfaces
 * @property {Array.<IdioUnion>} unions
 * @property {any} schemaGlobals - an Array or a single instance of GraphQL typeDefs, use filePath, string, or gql-tag.
 *
 *
 * @typedef {Object} config
 * @property {services} services
 * @property {locals} locals
 *
 *
 * @typedef Schema
 * @property {string} typeDefs
 * @property {Object} resolvers
 * @property {Object} resolvers.Query
 * @property {Object} resolvers.Mutation
 * @property {Object} resolvers.Subscription
 * @property {Object} schemaDirectives
 * @property {ServiceBroker} broker
 */

/**
 * @typedef {Object} GraphQLGateway
 * @property {() => Promise.<Schema>} start
 * @property {ServiceBroker} broker
 */

/**
 *
 * You can use GraphQLGateway to orchestrate a collection of GraphQLNode's & Schema Appliances exposed over a network.
 *
 * @param {config} config
 * @param {BrokerOptions} brokerOptions
 *
 * @returns {GraphQLGateway}
 */
```

```javascript
function GraphQLGateway(config: config, brokerOptions: BrokerOptions);
```

## Methods 

1. [**serve**](#serve)

### Serve 
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