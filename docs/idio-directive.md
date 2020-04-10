---
id: idio-directive
title: IdioDirective
---

```javascript 
const { IdioDirective } = require("idio-graphql");
```

## Intro

---

You can use **IdioDirective** to modularize a **[`DirectiveDefinition`](http://spec.graphql.org/June2018/#DirectiveDefinition)**, together with its resolver. 

> You can only specify directives 'top-level' at **[combineNodes](combine-nodes)**.


## Example

---

_Example uses **[graphql-auth-directives](https://www.npmjs.com/package/graphql-auth-directives)**_

```javascript
const hasScopeDirective = new IdioDirective({
    name: "hasScope",
    typeDefs: `
        directive @hasScope(
            scopes: [ String ]!
        ) on FIELD_DEFINITION 
    `,
    resolver: HasScopeDirective
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
 class IdioDirective {
     name: string;

     typeDefs: string;

     /** @type {SchemaDirectiveVisitor} */
     resolver: any;
     
     constructor(input: {
         name: string;
         typeDefs: string | DocumentNode;
         /** @type {SchemaDirectiveVisitor} */ resolver: any;
     });
 }
```
