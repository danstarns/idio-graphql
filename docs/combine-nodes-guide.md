---
id: combine-nodes-guide
title: Combine Nodes
---

## Intro

Once you have created your **[GraphQLNodes](graphql-node)** you will need to combine them to produce 1 single GraphQL schema.

## Nodes
You should provide an array of Node's that are required in the schema. 

```javascript
const { GraphQLNode, combineNodes } = require("idio-graphql");

const User = new GraphQLNode({
    name: "User",
    typeDefs: gql`
         type User {
            name: String
            age: Int
        }

        type Query {
            user: User
        }
    `,
    resolvers: {
        Query: {
            user: () => { ... }
        }
    }
});

async function main(){
    const { typeDefs, resolvers } = await combineNodes(
        [ User ], 
        schemaAppliances
    );
}

main()
```

>The nodes should only be top level, if you take the **[nodes example](creating-nodes#nodes)** from the last page. You should only provide the `User` Node. 

```javascript
const Comment = new GraphQLNode({
    name: "Comment",
    ...
});

const Post = new GraphQLNode({
    name: "Post",
    nodes: [ Comment ],
    ...
});

const User = new GraphQLNode({
    name: "User",
    nodes: [ Post ]
    ...
});

async function main(){
    const { typeDefs, resolvers } = await combineNodes(
        [ User ]
        schemaAppliances
    );
}

main()
```

## Schema Appliances
```javascript
async function main(){
    const { typeDefs, resolvers } = await combineNodes(
        [ User ], 
        {
            enums, 
            scalars, 
            directives, 
            interfaces,
            unions,
            schemaGlobals
        }
    );
}

main()
```
Continue reading to learn more about **[Schema Appliances](schema-appliances)**.