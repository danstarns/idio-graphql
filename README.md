# idio-graphql

Node.js framework that enables engineers to effortlessly distribute a GraphQL schema across many files & or communication channels. 


```
$ npm install idio-graphql
```

# Docs 
https://danstarns.github.io/idio-graphql/

# Contributing 
https://github.com/danstarns/idio-graphql/blob/master/contributing.md

# Slack
Need help? Wanna chat? Come on our [Slack](https://idio-graphql.slack.com)

# Quick Start
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
    const { typeDefs, resolvers } = combineNodes([ User ]);

    const server = new ApolloServer({ typeDefs, resolvers });

    await server.listen(4000);

    console.log(`Server up on port 4000 🚀`);
}

main();

```