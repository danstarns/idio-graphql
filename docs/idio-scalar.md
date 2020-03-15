---
id: idio-scalar
title: IdioScalar
---

```javascript 
const { IdioScalar } = require("idio-graphql");
```

## Intro

---

You can use **IdioScalar** to modularize a **[`ScalarTypeDefinition`](http://spec.graphql.org/June2018/#ScalarTypeDefinition)**, together with its resolver. 

> You can only apply scalars 'top-level' at **[combineNodes](combine-nodes)**.

> **IdioScalar** does not require `typeDefs`, it uses the name to match up the resolver.


## Example

---

_Example uses **[graphql-type-json](https://github.com/taion/graphql-type-json)**_.

```javascript
const JSONScalar = new IdioScalar({
    name: "JSON",
    resolver: GraphQLJSON
});
```

## Definitions

---

```javascript
/**
 * @typedef IdioScalar
 * @property {string} name
 * @property {GraphQLScalarType} resolver
 */

/**
 * You can use IdioScalar to modularize a ( ScalarTypeDefinition ), together with its resolver.
 *
 * You can only specify scalars 'top-level' at combineNodes.
 *
 * IdioScalar does not require typeDefs, it uses the name to match up the resolver.
 *
 * @param {object} config
 * @param {string} config.name
 * @param {GraphQLScalarType} config.resolver
 *
 * @returns {IdioScalar}
 */
```

```javascript
new IdioScalar({ name: string, resolver: GraphQLScalarType });
```