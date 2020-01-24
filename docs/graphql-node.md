---
id: graphql-node
title: GraphQLNode
---

```javascript 
const { GraphQLNode } = require("idio-graphql")
```

## Intro

---

You can use **GraphQLNode** to modularize an **[`ObjectTypeDefinition`](http://spec.graphql.org/June2018/#ObjectTypeDefinition)** together with its related resolvers & properties. 

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
    injections: () => ({}),
    enums: [ IdioEnum ],
    interfaces: [ IdioInterface ],
    unions: [ IdioUnion ]
});
```

## Definitions

---

```javascript
/**
 * @typedef ResolverObjectInput
 * @property {Function} resolve
 * @property {PreUnion} pre - Function(s) to call pre the resolve method.
 * @property {PostUnion} post - Function(s) to call post the resolve method.
 */

/**
 * @typedef {(ResolverObjectInput|Function)} ResolverUnion
 */

/**
 * @typedef ResolverType
 * @property {Object.<string, ResolverUnion>} Query
 * @property {Object.<string, ResolverUnion>} Mutation
 * @property {Object.<string, {subscribe: Function}>} Subscription
 * @property {Object.<string, ResolverUnion>} Fields
 */

/**
 * @typedef GraphQLNode
 * @property {string} name
 * @property {Promise<string>} typeDefs
 * @property {ResolverType} resolvers
 * @property {Array.<GraphQLNode>} nodes
 * @property {any} injections
 * @property {Array.<IdioEnum>} enums
 * @property {Array.<IdioInterface>} interfaces
 * @property {Array.<IdioUnion>} unions
 * @property {(brokerOptions: BrokerOptions) => ServiceBroker} serve
 */

/**
 * @typedef GraphQLNodeInput
 * @property {string} name
 * @property {any} typeDefs - gql-tag, string or filePath.
 * @property {ResolverType} resolvers
 * @property {Array.<GraphQLNode>} nodes
 * @property {any} injections
 * @property {Array.<IdioEnum>} enums
 * @property {Array.<IdioInterface>} interfaces
 * @property {Array.<IdioUnion>} unions
 */

/**
 * Creates a instance of a GraphQLNode.
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
const broker = await User.serve({
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