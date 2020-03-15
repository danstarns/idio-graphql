---
id: graphql-node
title: GraphQLNode
---

```javascript 
const { GraphQLNode } = require("idio-graphql")
```

## Intro

---

You can use **GraphQLNode** to modularize a **[`ObjectTypeDefinition`](http://spec.graphql.org/June2018/#ObjectTypeDefinition)** together with its related resolvers & properties. 

## Example

---

```javascript 
const User = new GraphQLNode({
    name: "User",
    typeDefs: `
        type User {
            name: String
            age: String
        }

        ...
    `,
    resolvers: { Query, Mutation, Subscription, Fields },
    nodes: [ GraphQLNode ],
    injections: {},
    enums: [ IdioEnum ],
    interfaces: [ IdioInterface ],
    unions: [ IdioUnion ]
});
```

## Definitions

---

```javascript
/**
 * @typedef Resolvers
 * @property {Object.<string, ResolverUnion>} Query
 * @property {Object.<string, ResolverUnion>} Mutation
 * @property {Object.<string, {subscribe: Function}>} Subscription
 * @property {Object.<string, ResolverUnion>} Fields
 */

/**
 * @typedef GraphQLNode
 * @property {string} name
 * @property {string} typeDefs
 * @property {Resolvers} resolvers
 * @property {GraphQLNode[]} nodes
 * @property {injections} injections
 * @property {IdioEnum[]} enums
 * @property {IdioInterface[]} interfaces
 * @property {IdioUnion[]} unions
 * @property {GraphQLType[]} types
 * @property {(brokerOptions: IdioBrokerOptions) => Runtime} serve
 */

/**
 * @typedef GraphQLNodeInput
 * @property {string} name
 * @property {any} typeDefs - gql-tag, string or filePath.
 * @property {Resolvers} resolvers
 * @property {GraphQLNode[]} nodes
 * @property {injections} injections
 * @property {IdioEnum[]} enums
 * @property {IdioInterface[]} interfaces
 * @property {IdioUnion[]} unions
 * @property {GraphQLType[]} types
 */

/**
 * You can use GraphQLNode to modularize a ObjectTypeDefinition together with its related resolvers & properties.
 *
 * @param {GraphQLNodeInput} config
 *
 * @returns {GraphQLNode}
 */
```

```javascript
new GraphQLNode(config: GraphQLNodeInput)
```

## Methods 

---

1. [**serve**](#serve)

### Serve 

---

> **https://moleculer.services/docs/0.12/broker.html**

#### Example
```javascript
await User.serve({
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