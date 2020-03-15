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

## Definitions

---

```javascript
/**
 * @typedef {{
 *      name: string,
 *      typeDefs: string | DocumentNode,
 *      resolvers: Object<string, ResolverUnion>,
 *      injections: Object<string, any>
 * }} GraphQLTypeInput
 */

/**
 * @typedef {{
 *      name: string,
 *      typeDefs: string,
 *      resolvers: Object<string, function>,
 *      injections: Object<string, any>,
 *      serve: (brokerOptions: BrokerOptions) => Promise<ServiceBroker>
 * }} GraphQLType
 */

/**
 * You can use GraphQLType to modularize a ObjectTypeDefinition, together with its Field resolvers.
 *
 * You can specify types 'top-level' at combineNodes or at an GraphQLNode level.
 *
 * @param {GraphQLTypeInput} input
 * @returns {GraphQLType}
 */
```

```javascript
new GraphQLType({ name: string, typeDefs: any, resolvers: Object<string, any> );
```

## Methods 

---

1. [**serve**](#serve)

### Serve 

---

> **https://moleculer.services/docs/0.12/broker.html**

#### Example
```javascript
await Metadata.serve({
    transporter: "NATS"
});
```

#### Definitions
```javascript
/**
 * @typedef Runtime
 * @property {ServiceBroker} broker
 * @property {Object<string, ServiceManager>} gatewayManagers
 * @property {boolean} initialized
 * @property {Object<string, object>} introspection
 * @property {IdioBrokerOptions} brokerOptions
 */

/**
 * @param {IdioBrokerOptions} brokerOptions
 * @returns {Promise<Runtime>}
 */
```

```javascript
async function serve(brokerOptions: BrokerOptions);
```