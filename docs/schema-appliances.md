---
id: schema-appliances
title: Schema Appliances
---

## Intro
**Schema Appliances** or 'schema extras' are parts of the GraphQL schema that is not a Node. This includes; 

1. [`enums`](#enums)
2. [`scalars`](#scalars)
3. [`directives`](#directives)
4. [`schemaGlobals`](#schemaGlobals)


## enums
If you need to apply enums to your schema you can pass `enums`, an array of **[IdioEnum](idio-enum)**. 

```javascript
const { IdioEnum, combineNodes, GraphQLNode } = require("idio-graphql");

const StatusEnum = new IdioEnum({
    name: "StatusEnum",
    typeDefs: `
        enum StatusEnum {
            ONLINE
            OFFLINE
            INACTIVE
        }
    `,
    resolver: {
        ONLINE: "online",
        OFFLINE: "offline",
        INACTIVE: "inactive"
    }
});

const User = new GraphQLNode({
    name: "User",
    typeDefs: `
        type User {
            name: String
            age: Int
            status: StatusEnum
        }

        ...
    `, 
    ...
});

async function main(){
    const { typeDefs, resolvers } = await combineNodes(
        [ User ], 
        { enums: [ StatusEnum ] }
    );
}

main()
```

## scalars
If you need to apply scalars to your schema you can pass `scalars`, an array of **[IdioScalar](idio-scalar)**.  The scalar does not require `typeDefs` it uses the scalar name to match up the resolver.

_example uses **[graphql-type-json](https://github.com/taion/graphql-type-json)**_.

```javascript
const { IdioScalar, combineNodes, GraphQLNode } = require("idio-graphql");
const { GraphQLJSON } = require("graphql-type-json");

const JSONScalar = new IdioScalar({
    name: "JSON",
    resolver: GraphQLJSON
});

const User = new GraphQLNode({
    name: "User",
    typeDefs: `
        type User {
            name: String
            age: Int
            metadata: JSON
        }

        ...
    `, 
    ...
});

async function main(){
    const { typeDefs, resolvers } = await combineNodes(
        [ User ], 
        { scalars: [ JSONScalar ] }
    );
}

main()
```

## directives
If you need to apply directives to your schema you can pass `directives`, an array of **[IdioDirective](idio-directive)**.

_example uses **[graphql-auth-directives](https://www.npmjs.com/package/graphql-auth-directives)**_

```javascript
const { IdioDirective, combineNodes, GraphQLNode } = require("idio-graphql");
const { HasScopeDirective } = require("graphql-auth-directives");

const hasScopeDirective = new IdioDirective({
    name: "hasScope",
    typeDefs: `
        directive @hasScope(
            scopes: [ String ]!
        ) on FIELD_DEFINITION 
    `, 
    resolver: HasScopeDirective
});


const User = new GraphQLNode({
    name: "User",
    typeDefs: `
        type User {
            name: String
            age: Int
        }

        type Query {
            getUser: User @hasScope(scopes: [ admin ])
        }
    `, 
    ...
});

async function main(){
    const { typeDefs, resolvers } = await combineNodes(
        [ User ], 
        { directives: [ hasScopeDirective ] }
    );
}

main()
```


## schemaGlobals
If you have type definition's that are generic to multiple Node's, you can provide a string or an array of strings to `schemaGlobals` where they will combine into the resulting `typeDefs`.

```javascript
const { combineNodes, GraphQLNode } = require("idio-graphql");

const User = new GraphQLNode({
    name: "User",
    typeDefs: `
        type User {
            name: String
            age: Int
            timeStamp: TimeStamp
        }

        ...
    `, 
    ...
});

async function main(){
    const { typeDefs, resolvers } = await combineNodes(
        [ User ], 
        { schemaGlobals: [ 
            `
            type TimeStamp {
                updatedAt: String
                createdAt: String
            }
            ` 
        ] }
    );
}

main()
```



