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
    unions: [ IdioUnion ],
    types: [ GraphQLType ]
});
```

## Definition

---

```typescript
/**
* You can use GraphQLNode to modularize a ObjectTypeDefinition
* together with its related resolvers & properties.
*/
class GraphQLNode {
    name: string;

    typeDefs: string;

    resolvers: Resolvers;

    nodes?: GraphQLNode[];
    
    injections?: { [k: string]: any; execute: InterSchemaExecute };

    enums?: IdioEnum[];

    interfaces?: IdioInterface[];

    unions?: IdioUnion[];

    types?: GraphQLType[];

    constructor(input: {
        name: string;
        typeDefs: string | DocumentNode;
        resolvers: Resolvers;
        nodes?: GraphQLNode[];
        injections?: { [k: string]: any };
        enums?: IdioEnum[];
        interfaces?: IdioInterface[];
        unions?: IdioUnion[];
        types?: GraphQLType[];
    });

    serve: (brokerOptions: IdioBrokerOptions) => Promise<ServiceBroker>;
}
```


