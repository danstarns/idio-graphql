---
id: idio-interface
title: IdioInterface
---

```javascript 
const { IdioInterface } = require("idio-graphql");
```

## Intro
You can use **IdioInterface** to modularize an **[`InterfaceTypeDefinition`](http://spec.graphql.org/June2018/#InterfaceTypeDefinition)**, together with its resolver. You can specify interfaces 'top-level' at **[combineNodes](combine-nodes)** or at an **[GraphQLNode](graphql-node)** level.

## Example

```javascript
const { IdioInterface } = require("idio-graphql");

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
})
```


## Definitions

```javascript
/**
 * @typedef IdioInterface
 * @property {string} name
 * @property {Promise<string>} typeDefs
 * @property {{__resolveType: () => string}} resolver
 * @property {(brokerOptions: BrokerOptions) => Promise.<ServiceBroker>} serve
 */

/**
 * You can use IdioInterface to modularize an InterfaceTypeDefinition, together with its resolver.
 * You can specify interfaces 'top-level' at combineNodes or at an GraphQLNode level.
 *
 * @param {Object} config
 * @param {string} config.name
 * @param {any} config.typeDefs - gql-tag, string or filePath.
 * @param {{__resolveType: () => string}} config.resolver
 *
 * @returns {IdioInterface}
 */
```

```javascript
new IdioInterface({ name: string, typeDefs: any, resolver: { __resolveType: () => string } );
```

## Methods 

1. [**serve**](#serve)

### Serve 
> **https://moleculer.services/docs/0.12/broker.html**

#### Example
```javascript
const broker = await ErrorInterFace.serve({
    transporter: "NATS"
});
```

#### Definitions
```javascript
/**
 * @function serve
 * @param {BrokerOptions} brokerOptions
 * @returns {Promise.<ServiceBroker>}
*/
```

```javascript
async function serve(brokerOptions: BrokerOptions);
```