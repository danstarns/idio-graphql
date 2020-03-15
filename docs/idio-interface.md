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


## Definitions

---

```javascript
/**
 * @typedef IdioInterface
 * @property {string} name
 * @property {string} typeDefs
 * @property {{__resolveType: () => string}} resolver
 * @property {(brokerOptions: BrokerOptions) => Promise<ServiceBroker>} serve
 */

/**
 * You can use IdioInterface to modularize a InterfaceTypeDefinition, together with its resolver.
 *
 * You can specify interfaces 'top-level' at combineNodes or at an GraphQLNode level.
 *
 * @param {object} config
 * @param {string} config.name
 * @param {(string|DocumentNode)} config.typeDefs - gql-tag, string or filePath.
 * @param {{__resolveType: () => string}} config.resolver
 *
 * @returns {IdioInterface}
 */
```

```javascript
new IdioInterface({ name: string, typeDefs: any, resolver: { __resolveType: () => string } );
```

## Methods 

---

1. [**serve**](#serve)

### Serve 

---

> **https://moleculer.services/docs/0.12/broker.html**

#### Example
```javascript
await ErrorInterFace.serve({
    transporter: "NATS"
});
```

#### Definitions
```javascript
/**
 * @typedef Runtime
 * @property {IdioBrokerOptions} brokerOptions
 * @property {ServiceBroker} broker
 * @property {Object.<string, ServiceManager>} gatewayManagers
 * @property {boolean} initialized
 * @property {Object.<string, object>} introspection
 */

/**
 * @function serve
 * @param {BrokerOptions} brokerOptions
 * @returns {Promise<Runtime>}
*/
```

```javascript
async function serve(brokerOptions: BrokerOptions);
```