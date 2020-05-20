# idio-graphql
[![CircleCI](https://circleci.com/gh/danstarns/idio-graphql/tree/master.svg?style=svg)](https://app.circleci.com/pipelines/github/danstarns/idio-graphql?branch=master)
[![CircleCI](https://img.shields.io/github/license/danstarns/idio-graphql)](https://github.com/danstarns/idio-graphql/blob/master/LICENSE) [![npm version](https://badge.fury.io/js/idio-graphql.svg)](https://www.npmjs.com/package/idio-graphql) [![Help Wanted!](https://img.shields.io/badge/help-wanted-brightgreen.svg?style=flat "Please Help Us")](https://github.com/danstarns/idio-graphql/issues) [![TypeScript Compatible](https://img.shields.io/npm/types/scrub-js.svg)](https://github.com/danstarns/idio-graphql/blob/master/index.d.ts) [![Gitter](https://badges.gitter.im/idio-graphql/community.svg)](https://gitter.im/idio-graphql/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge) [![GitHub stars](https://img.shields.io/github/stars/danstarns/idio-graphql.svg?style=social&label=Star&maxAge=2592000)](https://github.com/danstarns/idio-graphql)


```
$ npm install idio-graphql
```

Node.js framework that enables engineers to effortlessly distribute a GraphQL schema across many files or communication channels.

> This package is inspired by and or build's upon; Apollo Federation, GraphQL Modules & Moleculer.

## Links
1. [GitHub](https://github.com/danstarns/idio-graphql)
2. [Documentation](https://danstarns.github.io/idio-graphql/)
3. [Gitter](https://gitter.im/idio-graphql/community?utm_source=share-link&utm_medium=link&utm_campaign=share-link)
4. [NPM](https://www.npmjs.com/package/idio-graphql)

## Modules

```javascript
const User = new GraphQLNode({
    name: "User",
    typeDefs: `
        type User {
            id: ID
            name: String
            age: Int
        }

        type Query {
            user(id: ID!): User
        }
    `,
    resolvers: { ... }
});

const { typeDefs, resolvers } = combineNodes([ User ]);

const server = new ApolloServer({ typeDefs, resolvers });
```

## Microservices
```javascript
// User Service 
await User.serve({ // User node from the example above ^
    gateway: "gateway",
    transporter: "NATS"
});

// Gateway Service 
const gateway = new GraphQLGateway(
    { services: { nodes: ["User"] } },
    {
        transporter: "NATS",
        nodeID: "gateway"
    }
);

const { typeDefs, resolvers } = await gateway.start();

const server = new ApolloServer({
    typeDefs,
    resolvers
});

await server.listen(4000);
```