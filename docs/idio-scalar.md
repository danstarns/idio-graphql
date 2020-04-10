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

## Definition

---

```typescript
/**
 * You can use IdioDirective to modularize a DirectiveDefinition,
 * together with its resolver. You can only specify directives 'top-level'
 * at combineNodes.
 */
class IdioScalar {
    name: string;

    typeDefs: string;

    /** @type {GraphQLScalarType} */
    resolver: any;
    
    constructor(input: {
        name: string;
        /** @type {GraphQLScalarType} */ resolver: any;
    });
}
```