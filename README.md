# idio-graphql
[![GitHub license](https://img.shields.io/github/license/danstarns/idio-graphql)](https://github.com/danstarns/idio-graphql/blob/master/LICENSE) [![Coverage](https://img.shields.io/badge/coverage-100%25-green)](https://github.com/danstarns/idio-graphql/tree/master/test) [![Stars](https://img.shields.io/github/stars/danstarns/idio-graphql)](https://github.com/danstarns/idio-graphql)

```
$ npm install idio-graphql
```

# Intro

[idio-graphql](https://github.com/danstarns/idio-graphql) provides a set of [methods](https://github.com/danstarns/idio-graphql#API) to enable developers to structure and modularize a [GraphQL](https://graphql.org/) API into individual, maintainable, modules.

# Index
<!-- toc -->
* [Intro](https://github.com/danstarns/idio-graphql#Intro)
* [Contributing](https://github.com/danstarns/idio-graphql/blob/master/.github/CONTRIBUTING/contributing.md)
* [Getting Started](https://github.com/danstarns/idio-graphql#Getting-Started)
* [API](https://github.com/danstarns/idio-graphql#API)
    * [GraphQLNode](https://github.com/danstarns/idio-graphql#GraphQLNode)
    * [combineNodes](https://github.com/danstarns/idio-graphql#combineNodes)
    * [IdioEnum](https://github.com/danstarns/idio-graphql#IdioEnum)
    * [IdioScalar](https://github.com/danstarns/idio-graphql#IdioScalar)
    * [IdioDirective](https://github.com/danstarns/idio-graphql#IdioDirective)
* [Changelog](https://github.com/danstarns/idio-graphql#Changelog)
* [License](https://github.com/danstarns/idio-graphql/blob/master/LICENSE)
<!-- tocstop -->

# Getting Started
Examples use [apollo-server](https://www.npmjs.com/package/apollo-server) however, feel free to plug into your own solution. 

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

[`GraphQLNode`](https://github.com/danstarns/idio-graphql#GraphQLNode) is at the core of idio-graphql, enables developers to encapsulate each node within your graphql API. Its recommended to create new folders for `resolvers` to separate logic & keep things clean.

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

[`combineNodes`](https://github.com/danstarns/idio-graphql#combineNodes) is where all the magic happens, (its a big reduce). [`combineNodes`](https://github.com/danstarns/idio-graphql#combineNodes) will combine; [`GraphQLNodes`](https://github.com/danstarns/idio-graphql#GraphQLNode), [`IdioScalars`](https://github.com/danstarns/idio-graphql#IdioScalar), [`IdioEnums`](https://github.com/danstarns/idio-graphql#IdioEnum) & [`IdioDirectives`](https://github.com/danstarns/idio-graphql#IdioDirective) together to produce...

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
 * @property {string} typeDefs - graphql typeDefs.
 * @property {Object} resolvers - graphql resolvers.
 * @property {Object} resolvers.Query - graphql resolvers.Query.
 * @property {Object} resolvers.Mutation - graphql resolvers.Mutation.
 * @property {Object} resolvers.Subscription - graphql resolvers.Subscription.
 * @property {Object} schemaDirectives - graphql schemaDirectives resolvers.
 */

/**
 * @typedef {Object} appliances
 * @property {Array.<IdioScalar>} scalars
 * @property {Array.<IdioEnum>} enums
 * @property {Array.<IdioDirective>} directives
 * @property {any} schemaGlobals - an Array or a single instance of Graphql typedefs, use filePath, string, or gql-tag.
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

```javascript 
const { IdioEnum } = require("idio-graphql");
```

## intro
If you need to declare an enum with a resolver. [`IdioEnum`](https://github.com/danstarns/idio-graphql#IdioEnum) allows developers to modularize an enum within the graphql API. You can specify enums top-level at [`combineNodes`](https://github.com/danstarns/idio-graphql#combineNodes) or at a [`GraphQLNode`](https://github.com/danstarns/idio-graphql#GraphQLNode) level. 

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
 * @param {string} config.typeDefs - Graphql typedefs, use filePath, string, or gql-tag.
 * @param {Object} config.resolver - The Enum resolver.
 *
 * @returns IdioEnum
 */
```

# IdioScalar

1. [source](https://github.com/danstarns/idio-graphql/blob/master/src/idio-scalar.js)
2. [tests](https://github.com/danstarns/idio-graphql/blob/master/test/idio-scalar.test.js)

```javascript 
const { IdioScalar } = require("idio-graphql");
```

## intro
If you need to declare an scalar, idio-graphql encourages the developer to separate the type definition and resolver for the scalar. [`IdioScalar`](https://github.com/danstarns/idio-graphql#IdioScalar) allows developers to modularize a scalar within the graphql API. You can only specify scalars top-level at [`combineNodes`](https://github.com/danstarns/idio-graphql#combineNodes).

_note [`IdioScalar`](https://github.com/danstarns/idio-graphql#IdioScalar) does not require typeDefs it uses the Scalar name to match up the resolver._

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

1. [source](https://github.com/danstarns/idio-graphql/blob/master/src/idio-enum.js)
2. [tests](https://github.com/danstarns/idio-graphql/blob/master/test/idio-enum.test.js)

```javascript 
const { IdioDirective } = require("idio-graphql");
```

## intro
[`IdioDirective`](https://github.com/danstarns/idio-graphql#IdioDirective) allows developers to modularize an directive within the graphql API. You can only specify scalars top-level at [`combineNodes`](https://github.com/danstarns/idio-graphql#combineNodes).

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
 * @param {string} config.typeDefs - Graphql typedefs, use filePath, string, or gql-tag.
 * @param {Object} config.resolver - The Directive resolver.
 *
 * @returns IdioDirective
 */
```

# Changelog
_Change log started at release 1.1.0_

All notable changes to this project will be documented in this section. This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2019-25-12
[see changes](https://github.com/danstarns/idio-graphql/blob/master/changelog/2.1.0.md)

## [2.0.0] - 2019-23-12
[see changes](https://github.com/danstarns/idio-graphql/blob/master/changelog/2.0.md)

## [1.1.0] - 2019-11-12
### Added
- Provide [`IdioDirectives`](https://github.com/danstarns/idio-graphql#IdioDirective) to [`combineNodes`](https://github.com/danstarns/idio-graphql#combineNodes)

