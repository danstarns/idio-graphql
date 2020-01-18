# idio-graphql
[![GitHub license](https://img.shields.io/github/license/danstarns/idio-graphql)](https://github.com/danstarns/idio-graphql/blob/master/LICENSE) [![Stars](https://img.shields.io/github/stars/danstarns/idio-graphql)](https://github.com/danstarns/idio-graphql) [![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/idio-graphql)


```
$ npm install idio-graphql
```

# Docs 
http://www.mydocs.com/docs

## Quick Start
`$ npm install idio-graphql apollo-server graphql-tag`

Examples use **[apollo-server](https://www.npmjs.com/package/apollo-server)** however, feel free to plug into your own solution. 

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
            user: (parent, { id }) => { ... }
        }
    }
});

async function main() {
    const { typeDefs, resolvers } = await combineNodes([ User ]);

    const server = new ApolloServer({ typeDefs, resolvers });

    await server.listen(4000);

    console.log(`Server up on port 4000 🚀`);
}

main();

```