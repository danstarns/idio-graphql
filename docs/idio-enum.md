---
id: idio-enum
title: IdioEnum
---

```javascript 
const { IdioEnum } = require("idio-graphql");
```

## Intro

---

You can use **IdioEnum** to modularize an **[`EnumTypeDefinition`](http://spec.graphql.org/June2018/#EnumTypeDefinition)**, together with its resolver. You can specify enums 'top-level' at **[combineNodes](combine-nodes)** or at an **[GraphQLNode](graphql-node)** level. 

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


## Definitions

---

```javascript
/**
 * @typedef IdioEnum
 * @property {string} name
 * @property {Promise.<string>} typeDefs
 * @property {Object} resolver
 * @property {(brokerOptions: BrokerOptions) => Promise.<ServiceBroker>} serve
 */

/**
 * You can use IdioEnum to modularize an EnumTypeDefinition, together with its resolver.
 * You can specify enums 'top-level' at combineNodes or at an GraphQLNode level.
 *
 * @param {Object} config
 * @param {string} config.name
 * @param {any} config.typeDefs - gql-tag, string or filePath.
 * @param {Object} config.resolver
 *
 * @returns {IdioEnum}
 */
```

```javascript
new IdioEnum({ name: string, typeDefs: any, resolver: {} );
```

## Methods 

---

1. [**serve**](#serve)

### Serve 

---

> **https://moleculer.services/docs/0.12/broker.html**

#### Example
```javascript
const broker = await StatusEnum.serve({
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