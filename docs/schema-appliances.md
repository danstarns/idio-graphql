---
id: schema-appliances
title: Schema Appliances
---

## Intro
**Schema Appliances** or 'schema extras' are parts of the GraphQL schema that is not a Node. This includes;  

1. [**Enums**](#enums)
2. [**Scalars**](#scalars)
3. [**Directives**](#directives)
3. [**Interfaces**](#interfaces)
3. [**Unions**](#unions)
4. [**Schema Globals**](#schema-globals)

## Enums
You can use **[IdioEnums](idio-enum)** to apply **[Enumeration types](https://graphql.org/learn/schema/#enumeration-types)** to your GraphQL schema.


```javascript
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

You can encapsulate **[IdioEnums](idio-enum)** in a [**GraphQLNode**](graphql-node).

```javascript
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
    enums: [ StatusEnum ],
    ...
});
```

## Scalars
You can use **[IdioScalars](idio-scalar)** to apply **[Scalar types](https://graphql.org/learn/schema/#scalar-types)** to your GraphQL schema. A scalar does not require `typeDefs`.

> You can only specify scalars at [**combineNodes**](combine-nodes).

_example uses **[graphql-type-json](https://github.com/taion/graphql-type-json)**_.

```javascript
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

## Directives
You can use **[IdioDirectives](idio-directive)** to apply **[Directives](https://graphql.org/learn/queries/#directives)** to your GraphQL schema. 

> Ensure your GraphQL implementation supports Directives. 

_example uses **[graphql-auth-directives](https://www.npmjs.com/package/graphql-auth-directives)**._

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


const User = new GraphQLNode({
    name: "User",
    typeDefs: `
        type User ...

        type Query {
            getUser: User @hasScope(scopes: [ "admin" ])
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

## Interfaces
You can use **[IdioInterfaces](idio-interface)** to apply **[Interface types](https://graphql.org/learn/schema/#interfaces)** to your GraphQL schema.

```javascript
const PersonInterface = new IdioInterface({
    name: "PersonInterface",
    typeDefs: `
    interface PersonInterface {
        eyeColor: String
        hairColor: String
    }`,
    resolver: {
        __resolveType(obj) {
            if (obj.name) {
                return "User";
            }
        }
    }
});


const User = new GraphQLNode({
    name: "User",
    typeDefs: `
        type User implements PersonInterface {
            eyeColor: String
            hairColor: String
            name: String
            age: Int
        }

        type Query {
            getUser: PersonInterface
        }
    `, 
    ...
});

async function main(){
    const { typeDefs, resolvers } = await combineNodes(
        [ User ], 
        { interfaces: [ PersonInterface ] }
    );
}

main()
```

You can encapsulate **[IdioInterfaces](idio-interface)** in a [**GraphQLNode**](graphql-node).

```javascript
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
    interfaces: [ PersonInterface ],
    ...
});
```

## Unions
You can use **[IdioUnions](idio-union)** to apply **[Union types](https://graphql.org/learn/schema/#union-types)** to your GraphQL schema.

```javascript
const UserUnion = new IdioUnion({
    name: "UserUnion",
    typeDefs: `union UserUnion = User | Admin`,
    resolver: {
        __resolveType(obj) {
            if (obj.admin) {
                return "Admin";
            }
        }
    }
});


const User = new GraphQLNode({
    name: "User",
    typeDefs: `
        type User ...

        type Query {
            getUser: UserUnion
        }
    `, 
    ...
});

async function main(){
    const { typeDefs, resolvers } = await combineNodes(
        [ User ], 
        { 
            unions: [ UserUnion ],
            schemaGlobals: `
                type Admin {
                    name: String
                    age: Int
                    roles: [String]
                }
            `
        }
    );
}

main()
```

You can encapsulate **[IdioUnions](idio-union)** in a [**GraphQLNode**](graphql-node).

```javascript
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
    unions: [ UserUnion ],
    ...
});
```

## Schema Globals
If you have type definition's that are generic to multiple Node's, you can provide a string or an array of strings to [**combineNodes**](combine-nodes) where they will injected into the resulting `typeDefs`.

> If your Schema Global requires a resolver, you should prefer creating a [**GraphQLNode**](#graphql-node).

```javascript
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



