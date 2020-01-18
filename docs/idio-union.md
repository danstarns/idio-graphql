---
id: idio-union
title: IdioUnion
---

```javascript 
const { IdioUnion } = require("idio-graphql");
```

## Intro
You can use **IdioUnion** to modularize an **[`UnionTypeDefinition`](http://spec.graphql.org/June2018/#UnionTypeDefinition)**,
together with its resolver. You can specify unions 'top-level' at **[combineNodes](combine-nodes)** or at an **[GraphQLNode](graphql-node)** level.

## Example

```javascript
const { IdioUnion } = require("idio-graphql");

const AOrB = new IdioUnion({
    name: "AOrB",
    typeDefs: `union AOrB = A | B`,
    resolver: {
        __resolveType() {
            const x = ["A", "B"];

            return x[Math.ceil(Math.random())];
        }
    }
});
```


## Definitions

```javascript
/**
 * You can use IdioUnion to modularize an UnionTypeDefinition, together with its resolver.
 * You can specify unions 'top-level' at combineNodes or at an GraphQLNode level.
 *
 * @param {Object} config
 * @param {string} config.name
 * @param {any} config.typeDefs - gql-tag, string or filePath.
 * @param {{__resolveType: () => string}} config.resolver
 *
 * @returns {IdioUnion}
 */
```

```javascript
new IdioUnion({ name: string, typeDefs: any, resolver: { __resolveType: () => string } );
```

## Methods 

1. [**serve**](#serve)

### Serve 
> **https://moleculer.services/docs/0.12/broker.html**

#### Example
```javascript
const broker = await AOrB.serve({
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