# idio-graphql
[![GitHub license](https://img.shields.io/github/license/danstarns/idio-graphql)](https://github.com/danstarns/idio-graphql/blob/master/LICENSE) [![Coverage](https://img.shields.io/badge/coverage-100%25-green)](https://github.com/danstarns/idio-graphql/tree/master/test) [![Stars](https://img.shields.io/github/stars/danstarns/idio-graphql)](https://github.com/danstarns/idio-graphql) [![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/idio-graphql)


```
$ npm install idio-graphql
```

# Intro

[idio-graphql](https://github.com/danstarns/idio-graphql) provides a set of [methods](https://github.com/danstarns/idio-graphql#API) to enable developers to structure and modularize a [GraphQL](https://graphql.org/) API into individual, maintainable, modules.

# Index
<!-- toc -->
* [Intro](https://github.com/danstarns/idio-graphql#Intro)
* [Contributing](https://github.com/danstarns/idio-graphql/blob/master/contributing.md)
* [Getting Started](https://github.com/danstarns/idio-graphql#Getting-Started)
* [Guides](https://github.com/danstarns/idio-graphql#Guides)
    * [Dependency Injection](https://github.com/danstarns/idio-graphql#Dependency-Injection)
    * [Resolver Hooks](https://github.com/danstarns/idio-graphql#Resolver-Hooks)
    * [Composing Nodes](https://github.com/danstarns/idio-graphql#Composing-nodes)
* [API](https://github.com/danstarns/idio-graphql#API)
    * [GraphQLNode](https://github.com/danstarns/idio-graphql#GraphQLNode)
    * [combineNodes](https://github.com/danstarns/idio-graphql#combineNodes)
    * [IdioEnum](https://github.com/danstarns/idio-graphql#IdioEnum)
    * [IdioScalar](https://github.com/danstarns/idio-graphql#IdioScalar)
    * [IdioDirective](https://github.com/danstarns/idio-graphql#IdioDirective)
* [Gists](https://github.com/danstarns/idio-graphql#Gists)
* [Changelog](https://github.com/danstarns/idio-graphql#Changelog)
* [License](https://github.com/danstarns/idio-graphql/blob/master/LICENSE)
<!-- tocstop -->

# Getting Started

```
$ npm install idio-graphql apollo-server graphql-tag
```

Examples use [apollo-server](https://www.npmjs.com/package/apollo-server) however, feel free to plug into your own solution. 

_[gists](https://github.com/danstarns/idio-graphql#Gists)_

```javascript
const {
    combineNodes,
    GraphQLNode
} = require("idio-graphql");

const { ApolloServer } = require("apollo-server");
const gql = require("graphql-tag");

const User = new GraphQLNode({
    name: "User",
    typeDefs: gql`
        type User {
            id: ID
            name: String
            age: Int
        }

        type Query {
            user(id: ID!): User
        }
    `,
    resolvers: {
        Query: {
            user: (parent, { id }) => {
                // get user from source

                return user;
            }
        }
    }
});

async function main() {
    const { typeDefs, resolvers } = await combineNodes([User]);

    const server = new ApolloServer({ typeDefs, resolvers });

    await server.listen(4000);

    console.log(`Server up on port 4000 🚀`);
}

main();

```

# Guides
<!-- toc -->
* [Dependency Injection](https://github.com/danstarns/idio-graphql#Dependency-Injection)
* [Resolver Hooks](https://github.com/danstarns/idio-graphql#Resolver-Hooks)
* [Composing Nodes](https://github.com/danstarns/idio-graphql#Composing-nodes)
<!-- tocstop -->

# Dependency Injection
1. [gist](https://gist.github.com/danstarns/029500e68b627d4bd51ea0f2ea768d96)
2. [test](https://github.com/danstarns/idio-graphql/tree/master/test/gists/dependency-injection.test.js)

[GraphQLNode](https://github.com/danstarns/idio-graphql#GraphQLNode) allows you to provide a `injections` parameter. This can either be a value or a function, the result  to be appended to `context.injections` for each resolver.

```javascript
new GraphQLNode({
    injections: {}
})
```
```javascript
new GraphQLNode({
    injections: async () => ({})
})
```

With [apollo-server](https://www.npmjs.com/package/apollo-server) the context is the `arguments[2]` element. This is behind a __env flag `CONTEXT_INDEX` default is 2__
```javascript
new GraphQLNode({
    name: "User",
    typeDefs: gql`
        type User {
            name: String
        }

        type Query {
            user: User
        }
    `,
    injections: () => ({
        models: {...}
    }),
    resolvers: {
        Query: {
            user: (root, args, { injections }) => {
                return injections.models.User.findOne()
            }
        }
    }
})
```

# Resolver Hooks
1. [gist](https://gist.github.com/danstarns/769eaae250dd3970943836bc87aa8087)
2. [test](https://github.com/danstarns/idio-graphql/tree/master/test/gists/resolver-hooks.test.js)

Sometimes you might need to run function(s), `pre` or `post` your resolver. You could use [Schema Directives](https://www.apollographql.com/docs/graphql-tools/schema-directives/) with [IdioDirectives](https://github.com/danstarns/idio-graphql#IdioDirective)
for this. Resolver hooks allow you to achive similiar heights.

_You can describe resolver hook's on any [`GraphQLNode.resolver`](https://github.com/danstarns/idio-graphql#GraphQLNode)_

```javascript
new GraphQLNode({
    name: "User",
    typeDefs: gql`
        type User {
            name: String
        }

        type Query {
            users: User
        }
    `,
    resolvers: {
        Query: {
            users: {
                pre: isRequestAdmin,
                resolve: () => {
                    // return User.find()
                },
                post: updateAudit
            }
        }
    }
})
```

## Multiple hooks
An array of functions that will be resolved sequentiality. 

```javascript
Query: {
    users: {
        pre: [isRequestAdmin, canRequest(view("users"))],
        resolve: () => {
                // return User.find()
        }
    }
}
```

## Async hooks
All hooks can be `async` to be resolved sequentiality.

```javascript
Query: {
    users: {
        resolve: () => {
                // return User.find()
        },
        post: async (result) => {
            await updateAudit(result)
        }
    }
}
```

## `pre`
```javascript
/**
 * @callback PreHook
 * @param {any}    root - The GraphQl root argument.
 * @param {Object} args - The GraphQl args argument.
 * @param {Object} context - The GraphQl context argument.
 * @param {Object} info - The GraphQl info argument.
 */
```

## `post`
```javascript
/**
 * @callback PostHook
 * @param {any}    resolve - The outcome of the resolve method.
 * @param {any}    root - The GraphQl root argument.
 * @param {Object} args - The GraphQl args argument.
 * @param {Object} context - The GraphQl context argument.
 * @param {Object} info - The GraphQl info argument.
 */

```

# Composing Nodes
1. [gist](https://gist.github.com/danstarns/2cd0e6e14d51a07897268699450fef9b)
2. [test](https://github.com/danstarns/idio-graphql/tree/master/test/gists/nested-nodes.test.js)

You can recursivity nest [`GraphQLNode.nodes`](https://github.com/danstarns/idio-graphql#GraphQLNode).

```javascript
const Comment = new GraphQLNode({
    name: "Comment",
    typeDefs: gql`
        type Comment {
            id: ID
            content: String
            User: User
        }
        type Query {
            comment(id: ID!): Comment
        }
    `,
    resolvers: {
        Query: {
            comment: () => { }
        }
    }
});

const Post = new GraphQLNode({
    name: "Post",
    typeDefs: gql`
        type Post {
            id: ID
            title: String
            content: Int
            comments: [Comment]
        }
        type Query {
            post(id: ID!): Post
        }
    `,
    resolvers: {
        Query: {
            post: () => { }
        }
    },
    nodes: [Comment]
});
```


# API
<!-- toc -->
* [GraphQLNode](https://github.com/danstarns/idio-graphql#GraphQLNode)
* [combineNodes](https://github.com/danstarns/idio-graphql#combineNodes)
* [IdioEnum](https://github.com/danstarns/idio-graphql#IdioEnum)
* [IdioScalar](https://github.com/danstarns/idio-graphql#IdioScalar)
* [IdioDirective](https://github.com/danstarns/idio-graphql#IdioDirective)
<!-- tocstop -->

# GraphQLNode

1. [source](https://github.com/danstarns/idio-graphql/blob/master/src/graphql-node.js)
2. [tests](https://github.com/danstarns/idio-graphql/blob/master/test/graphql-node.test.js)

```javascript 
const { GraphQLNode } = require("idio-graphql")
```

## intro

You can use [`GraphQLNode`](https://github.com/danstarns/idio-graphql#GraphQLNode) to modularize a node ( `ObjectTypeDefinition` ) together with its related resolvers & nodes. 

**example**

```javascript 
const { GraphQLNode } = require("idio-graphql");

const Query = require("./Query/index.js");
const Mutation = require("./Mutation/index.js");
const Subscription = require("./Subscription/index.js");
const Fields = require("./Fields/index.js");
const enums = require("./enums/index.js");
const nodes = require("./nodes/index.js");

const User = new GraphQLNode({
    name: "User",
    typeDefs: "./User.gql", // gql-tag, string or filePath
    resolvers: { Query, Mutation, Subscription, Fields },
    enums,
    nodes
});


module.exports = User;
```

**definitions**

```javascript
/**
 * @typedef {Object} GraphQLNode
 * @property {string} name - The nodes name.
 * @property {Promise<string>} typeDefs - Graphql typeDefs resolver.
 * @property {Object} resolvers - Graphql resolvers
 * @property {Object} resolvers.Query - Graphql resolvers.Query
 * @property {Object} resolvers.Mutation - Graphql resolvers.Mutation
 * @property {Object} resolvers.Subscription - Graphql resolvers.Subscription
 * @property {Object} resolvers.Fields - Graphql resolvers.Fields
 * @property {Array.<IdioEnum>} enums - The nodes enums.
 * @property {Array.<GraphQLNode>} nodes - The nodes nested nodes.
 */

/**
 * @typedef {Object} GraphQLNodeConfig
 * @property {name} name - The nodes name.
 * @property {string} typeDefs - Graphql typeDefs, use filePath, string, or gql-tag
 * @property {{Query: {Object}, Mutation: {Object}, Subscription: {Object}, Fields: {Object} }} resolvers - The nodes resolvers.
 * @property {Array.<IdioEnum>} enums - The nodes enums.
 * @property {Array.<GraphQLNode>} nodes - The nodes nested nodes.
 */

/**
 * Creates a instance of a GraphQLNode.
 *
 * @param {GraphQLNodeConfig} config - An object.
 *
 * @returns GraphQLNode
 */
```

# combineNodes

1. [source](https://github.com/danstarns/idio-graphql/blob/master/src/combine-nodes.js)
2. [tests](https://github.com/danstarns/idio-graphql/blob/master/test/combine-nodes.test.js)

```javascript 
const { combineNodes } = require("idio-graphql")
```

## intro
 [`combineNodes`](https://github.com/danstarns/idio-graphql#combineNodes) will reduce; [`GraphQLNodes`](https://github.com/danstarns/idio-graphql#GraphQLNode), [`IdioScalars`](https://github.com/danstarns/idio-graphql#IdioScalar), [`IdioEnums`](https://github.com/danstarns/idio-graphql#IdioEnum) & [`IdioDirectives`](https://github.com/danstarns/idio-graphql#IdioDirective) to produce...

```javascript
const { typeDefs, resolvers, schemaDirectives } = await combineNodes(...);
```
ready to be passed to your favorite graphql implementation. 

1. [apollo-server](https://github.com/apollographql/apollo-server)
2. [graphql-yoga](https://github.com/prisma-labs/graphql-yoga)
3. [makeExecutableSchema](https://www.apollographql.com/docs/apollo-server/api/graphql-tools/)



**example**

```javascript 
const { combineNodes } = require("idio-graphql");

const nodes = require("./nodes/index.js");
const directives = require("./directives/index.js");
const scalars = require("./scalars/index.js");
const enums = require("./enums/index.js");
const schemaGlobals = require("./schemaGlobals/index.js");

async function main() {
    const { typeDefs, resolvers, schemaDirectives } = await combineNodes(
        nodes,
        {
            directives,
            scalars,
            enums,
            schemaGlobals
        }
    );

    const server = new ApolloServer({ typeDefs, resolvers, schemaDirectives });

    await server.listen(4000);

    console.log(`Server up on port 4000 🚀`);
}

main();
```

**definitions**

```javascript
/**
 * @typedef {Object} Schema
 * @property {string} typeDefs - GraphQL typeDefs.
 * @property {Object} resolvers - GraphQL resolvers.
 * @property {Object} resolvers.Query - GraphQL resolvers.Query.
 * @property {Object} resolvers.Mutation - GraphQL resolvers.Mutation.
 * @property {Object} resolvers.Subscription - GraphQL resolvers.Subscription.
 * @property {Object} schemaDirectives - GraphQL schemaDirectives resolvers.
 */

/**
 * @typedef {Object} appliances
 * @property {Array.<IdioScalar>} scalars
 * @property {Array.<IdioEnum>} enums
 * @property {Array.<IdioDirective>} directives
 * @property {any} schemaGlobals - an Array or a single instance of Graphql typeDefs, use filePath, string, or gql-tag.
 */

/**
 * Combines and returns the combined typeDefs and resolvers, ready to be passed into apollo-server, graphQL-yoga & makeExecutableSchema.
 *
 * @param {Array.<GraphQLNode>} nodes - Array of type GraphQLNode.
 * @param {appliances} appliances
 * @returns Schema
 */
```

# IdioEnum

1. [source](https://github.com/danstarns/idio-graphql/blob/master/src/idio-enum.js)
2. [tests](https://github.com/danstarns/idio-graphql/blob/master/test/idio-enum.test.js)
3. [gist](https://gist.github.com/danstarns/7df5a15eb02fa5b89fb89295403ef539)

```javascript 
const { IdioEnum } = require("idio-graphql");
```

## intro
You can use [`IdioEnum`](https://github.com/danstarns/idio-graphql#IdioEnum) to modularize an enum ( `EnumTypeDefinition` ), together with its resolver. You can specify enums 'top-level' at [`combineNodes`](https://github.com/danstarns/idio-graphql#combineNodes) or at a [`GraphQLNode`](https://github.com/danstarns/idio-graphql#GraphQLNode) level. 

**example**

```javascript
const { IdioEnum } = require("idio-graphql");

const StatusEnum = new IdioEnum({
    name: "StatusEnum",
    typeDefs: "./StatusEnum.gql", // gql-tag, string or filePath
    resolver: {
        ONLINE: "online",
        OFFLINE: "offline",
        INACTIVE: "inactive"
    }
});

module.exports = StatusEnum;
```

**`./StatusEnum.gql`**

```graphql
enum StatusEnum {
    ONLINE
    OFFLINE
    INACTIVE
}
```

**definitions**

```javascript
/**
 * @typedef {Object} IdioEnum
 * @property {string} name - The Enum name.
 * @property {Promise<string>} typeDefs - Graphql typeDefs resolver.
 * @property {Object} resolver - The Enum resolver.
 */

/**
 * Creates a instance of IdioEnum.
 *
 * @param {Object} config
 * @param {string} config.name - The Enum name.
 * @param {string} config.typeDefs - Graphql typeDefs, use filePath, string, or gql-tag.
 * @param {Object} config.resolver - The Enum resolver.
 *
 * @returns IdioEnum
 */
```

# IdioScalar

1. [source](https://github.com/danstarns/idio-graphql/blob/master/src/idio-scalar.js)
2. [tests](https://github.com/danstarns/idio-graphql/blob/master/test/idio-scalar.test.js)
3. [gist](https://gist.github.com/danstarns/ff911579b0c402ae97264577ffc6c4b1)

```javascript 
const { IdioScalar } = require("idio-graphql");
```

## intro
You can use [`IdioScalar`](https://github.com/danstarns/idio-graphql#IdioScalar) to modularize a scalar ( `ScalarTypeDefinition` ), together with its resolver. You can only apply scalars 'top-level' at [`combineNodes`](https://github.com/danstarns/idio-graphql#combineNodes).

_[`IdioScalar`](https://github.com/danstarns/idio-graphql#IdioScalar) does not require typeDefs it uses the Scalar name to match up the resolver._

_example uses [graphql-type-json](https://github.com/taion/graphql-type-json)_

**example**

```javascript
const { GraphQLJSON } = require("graphql-type-json");
const { IdioScalar } = require("idio-graphql");

const JSONScalar = new IdioScalar({
    name: "JSON",
    resolver: GraphQLJSON
});

module.exports = JSONScalar;
```

**definitions**

```javascript
/**
 * @typedef {Object} IdioScalar
 * @property {string} name - The Scalar name.
 * @property {Promise<string>} typeDefs - Graphql typeDefs resolver..
 * @property {Object} resolver - The Scalar resolver.
 */

/**
 * Creates a instance of IdioScalar.
 *
 * @param {Object} config
 * @param {string} config.name - The Scalar name.
 * @param {Object} config.resolver - The Scalar resolver.
 *
 * @returns IdioScalar
 */
```

# IdioDirective

1. [source](https://github.com/danstarns/idio-graphql/blob/master/src/idio-directive.js)
2. [tests](https://github.com/danstarns/idio-graphql/blob/master/test/idio-directive.test.js)
3. [gist](https://gist.github.com/danstarns/2fcfa8b560e7b47784d59648a0ec229d)

```javascript 
const { IdioDirective } = require("idio-graphql");
```

## intro
You can use [`IdioDirective`](https://github.com/danstarns/idio-graphql#IdioDirective) to modularize an directive ( `DirectiveDefinition` ), together with its resolver. You can only apply directives 'top-level' at [`combineNodes`](https://github.com/danstarns/idio-graphql#combineNodes).

_example uses [graphql-auth-directives](https://www.npmjs.com/package/graphql-auth-directives)_

**example**

```javascript
const { HasScopeDirective } = require("graphql-auth-directives");
const { IdioDirective } = require("idio-graphql");

const hasScopeDirective = new IdioDirective({
    name: "hasScope",
    typeDefs: "./HasScopeDirective.gql", // gql-tag, string or filePath
    resolver: HasScopeDirective
});

module.exports = hasScopeDirective;
```


**./HasScopeDirective.gql**

```graphql
directive @hasScope(
    scopes: [String]!
) on FIELD_DEFINITION 
```


**definitions**

```javascript
/**
 * @typedef {Object} IdioDirective
 * @property {string} name - The Directive name.
 * @property {Promise<string>} typeDefs - Graphql typeDefs resolver.
 * @property {Object} resolver - The Directive resolver.
 */

/**
 * Creates a instance of a IdioDirective.
 *
 * @param {Object} config
 * @param {string} config.name - The Directive name.
 * @param {string} config.typeDefs - Graphql typeDefs, use filePath, string, or gql-tag.
 * @param {Object} config.resolver - The Directive resolver.
 *
 * @returns IdioDirective
 */
```

# Gists
1. [Nested Nodes](https://gist.github.com/danstarns/2cd0e6e14d51a07897268699450fef9b)
2. [Field Resolvers](https://gist.github.com/danstarns/ff3d8153a08f70c45de676da9ab7a0cc)
3. [Node Enums](https://gist.github.com/danstarns/7df5a15eb02fa5b89fb89295403ef539)
4. [Directives](https://gist.github.com/danstarns/2fcfa8b560e7b47784d59648a0ec229d)
5. [Scalars](https://gist.github.com/danstarns/ff911579b0c402ae97264577ffc6c4b1)
6. [Schema Globals](https://gist.github.com/danstarns/4f85304e3fba292bc0da4d813987ce68)
6. [Dependency Injection](https://gist.github.com/danstarns/029500e68b627d4bd51ea0f2ea768d96)
6. [Resolver Hooks](https://gist.github.com/danstarns/769eaae250dd3970943836bc87aa8087)


# Changelog
_Change log started at release 1.1.0_

All notable changes to this project will be documented in this section. This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2019-29-12
[see changes](https://github.com/danstarns/idio-graphql/blob/master/changelog/2.2.0.md)

## [2.1.0] - 2019-25-12
[see changes](https://github.com/danstarns/idio-graphql/blob/master/changelog/2.1.0.md)

