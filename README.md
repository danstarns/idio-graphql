# idio-graphql (idiomatic-graphql)
[![GitHub license](https://img.shields.io/github/license/danstarns/idio-graphql)](https://github.com/danstarns/idio-graphql/blob/master/LICENSE) [![Coverage](https://img.shields.io/badge/coverage-100%25-green)](https://github.com/danstarns/idio-graphql/tree/master/test)

```
$ npm install idio-graphql
```

# Intro

idio-graphql provides a set of [methods](#API) to enable developers to structure and modularize a graphql API. idio-graphql encourages the practice of a schema first solution to architecting a graphql API. With all the tools around graphql, none was here to normalize the way our servers look. idio-graphql hopes to solve this.


# Index
<!-- toc -->
* [Intro](#Intro)
* [Getting Started](#Getting-Started)
* [API](#API)
<!-- tocstop -->


# Getting Started
Examples use [apollo-server](https://www.npmjs.com/package/apollo-server) however, feel free to plug into your own solution. 

If you want to get started straight away checkout the [example repo](https://github.com/danstarns/idio-graphql-example).

```javascript
const { ApolloServer } = require("apollo-server");
const { combineNodes } = require("idio-graphql");

const userNode = require("./user-node.js");

(async function Main() {
    try {
        const { typeDefs, resolvers } = await combineNodes([userNode]);

        const server = new ApolloServer({ typeDefs, resolvers });

        await server.listen(4000);

        console.log("Listing on localhost:4000/graphql");
    } catch (error) {
        console.error(error);
    }
})();
```
**`user-node.js`**

```javascript
const { GraphQLNode } = require("idio-graphql");

const Query = {
    getUser: async (_, { id }) => {
        // get user from db...

        return user
    }
};

const User = new GraphQLNode({
    name: "User",
    typeDefs: "./User.gql",
    resolvers: { Query }
});

module.exports = User;
```

**`User.gql`**
```graphql
type User {
    name: String
    age: Int
}

extend type Query {
    getUser(id: ID!): User
}
```

**example results**
```javascript 
const { typeDefs, resolvers } = await combineNodes([userNode]);
```

**typeDefs**
```graphql
type User {
    name: String
    age: Int
}

extend type Query {
    getUser(id: ID!): User
}

type Query
```

**resolvers**
```javascript
{
    Query: {
        getUser: async (_, { id }) => {
            // get user from db...

            return user;
        }
    }
};

```

_note that developer must use `extend` on all graphql [root types](https://graphql.org/learn/schema/)_ 

### Root types
1. Query => `extend type Query`
1. Mutation => `extend type Mutation`
1. Subscription => `extend type Subscription`

# API
<!-- toc -->
* [GraphQLNode](#GraphQLNode)
* [combineNodes](#combineNodes)
* [IdioEnum](#IdioEnum)
* [IdioScalar](#IdioScalar)
<!-- tocstop -->

# GraphQLNode

[`GraphQLNode`](#GraphQLNode) is at the core of idio-graphql, enables developers to encapsulate each node within your graphql API. its recommended to create new folders for `resolvers` to separate logic & keep things clean.

**example**

```javascript 
const { GraphQLNode } = require("idio-graphql");

const Query = require("./Query/index.js");
const Mutation = require("./Mutation/index.js");
const Subscription = require("./Subscription/index.js");
const Fields = require("./Fields/index.js");
const enums = require("./enums/index.js");

const User = new GraphQLNode({
    name: "User",
    typeDefs: "./User.gql",
    resolvers: { Query, Mutation, Subscription, Fields },
    enums
});

module.exports = User;
```

**definitions**

```javascript
/**
 * @typedef {Object} GraphQLNode
 * @property {string} name - The nodes name.
 * @property {string} typeDefs - Path to the nodes gql file.
 * @property {Object} resolvers - Graphql resolvers
 * @property {Object} resolvers.Query - Graphql resolvers.Query
 * @property {Object} resolvers.Mutation - Graphql resolvers.Mutation
 * @property {Object} resolvers.Subscription - Graphql resolvers.Subscription
 * @property {Object} resolvers.Fields - Graphql resolvers.Fields
 * @property {Array.<IdioEnum>} enums - The nodes enums.
 */
```

# combineNodes

[`combineNodes`](#combineNodes) is where all the magic happens, (its a big reduce). [`combineNodes`](#combineNodes) will combine; [`GraphQLNodes`](#GraphQLNode), [`IdioScalars`](#IdioScalar) & [`IdioEnums`](#IdioEnum) together to produce...

```javascript
const { typeDefs, resolvers } = await combineNodes(...);
```
ready to be passed to your favorite graphql implementation. 

1. [apollo-server](https://github.com/apollographql/apollo-server)
2. [graphql-yoga](https://github.com/prisma-labs/graphql-yoga)
3. [makeExecutableSchema](https://www.apollographql.com/docs/apollo-server/api/graphql-tools/)
4. and many more...

**definitions**

```javascript
/**
 * @typedef {Object} Schema
 * @property {string} typeDefs - graphql typeDefs
 * @property {Object} resolvers - graphql resolvers
 * @property {Object} resolvers.Query - graphql resolvers.Query
 * @property {Object} resolvers.Mutation - graphql resolvers.Mutation
 * @property {Object} resolvers.Subscription - graphql resolvers.Subscription
 */

/**
 * @typedef {Object} appliances
 * @property {Array.<IdioScalar>} scalars - array of IdioScalar
 * @property {Array.<IdioEnum>} enums - array of IdioEnum
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
If you need to declare an enum with a resolver, idio-graphql encourages the developer to separate the type definition and resolver for the enum. [`IdioEnum`](#IdioEnum) allows developers to modularize an enum within the graphql API. You can specify enums top-level [`combineNodes`](#combineNodes) or at a [`GraphQLNode`](#GraphQLNode) level. 

**example**

```javascript
const { IdioEnum } = require("idio-graphql");

const StatusEnum = new IdioEnum({
    name: "StatusEnum",
    typeDefs: "./StatusEnum.gql",
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
 * @property {string} typeDefs - Path to the Enum.gql file.
 * @property {Object} resolver - The Enum resolver
 */

/**
 * Creates a instance of a IdioEnum.
 *
 * @param {Object} config - An object.
 * @param {string} config.name - The Enum name.
 * @param {string} config.typeDefs - Path to the Enum.gql file.
 * @param {Object} config.resolver - The Enum resolver.
 *
 * @returns IdioEnum
 */
```

# IdioScalar
If you need to declare an scalar, idio-grphql encourages the developer to separate the type definition and resolver for the scalar. [`IdioScalar`](#IdioScalar) allows developers to modularize an scalar within the graphql API. You can only specify scalars top-level [`combineNodes`](#combineNodes).

_note [`IdioScalar`](#IdioScalar) does not require a .gql file, it seems useless to make a new file for 1 line._


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


# License

MIT License

Copyright (c) 2019 Daniel Starns

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
