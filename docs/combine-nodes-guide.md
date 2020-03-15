---
id: combine-nodes-guide
title: Combine Nodes
---

## Intro

---

Once you have created your **[GraphQLNode's](graphql-node)** you will need to combine them to produce a single GraphQL schema.

> The generated schema will be the outcome of **[makeExecutableSchema](https://github.com/apollographql/graphql-tools)**

## Nodes

---

You should provide an array of Node's that are required in the schema. 

```javascript
const User = new GraphQLNode({
    name: "User",
    ...
});

const { typeDefs, resolvers } = combineNodes([ User ]);
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

const { typeDefs, resolvers } =  combineNodes([ User ]);
```

## Schema Appliances

---

```javascript
const { typeDefs, resolvers } = combineNodes(
    nodes, 
    {
        enums, 
        scalars, 
        directives, 
        interfaces,
        unions,
        types,
        schemaGlobals
    }
);
```
Continue reading to learn more about **[Schema Appliances](schema-appliances)**.