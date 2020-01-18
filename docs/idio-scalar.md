---
id: idio-scalar
title: IdioScalar
---

```javascript 
const { IdioScalar } = require("idio-graphql");
```

## Intro
You can use **IdioScalar** to modularize an **[`ScalarTypeDefinition`](http://spec.graphql.org/June2018/#ScalarTypeDefinition)**, together with its resolver. 

> You can only apply scalars 'top-level' at **[combineNodes](combine-nodes)**.

> **IdioScalar** does not require `typeDefs`, it uses the name to match up the resolver.


## Example

_Example uses **[graphql-type-json](https://github.com/taion/graphql-type-json)**_.

```javascript
const { GraphQLJSON } = require("graphql-type-json");
const { IdioScalar } = require("idio-graphql");

const JSONScalar = new IdioScalar({
    name: "JSON",
    resolver: GraphQLJSON
});
```

## Definitions

```javascript
/**
 * @typedef IdioScalar
 * @property {string} name
 * @property {GraphQLScalarType} resolver
 */

/**
 * You can use IdioScalar to modularize an ScalarTypeDefinition, together with its resolver.
 * 
 * You can only specify scalars 'top-level' at combineNodes.
 * 
 * IdioScalar does not require typeDefs, it uses the name to match up the resolver.
 *
 * @param {Object} config
 * @param {string} config.name
 * @param {Object} config.resolver
 *
 * @returns {IdioScalar}
 */
```

```javascript
new IdioScalar({ name: string, resolver: GraphQLScalarType });
```