# idio-graphql (idiomatic-graphql)

`npm install idio-graphql`

A Schema first solution to structuring your graphql API. Allows developers to modularize graphql nodes & extend root types without the need for a blank type. 

### Common solution

```graphql
type Query {
    _blank: String
}
```

### idio solution

```graphql
extend type Query {
    myMethod: String
}
```

Developers wanting to modularize there schema would have to first write a blank type to later extend it. idio-graphql solves this. Simply use `extend` in all your modularized nodes & let the package combine them. (pssst.... its a big reduce!)

### idiomatic
With all the tools around graphql, none was here to normalize the way our servers look. idio-graphql employees 2 methods to help developers structure and architect their APIs. 

```const {GraphQLNode, combineNodes} = require("idio-graphql")```

### Getting started
Following the examples, you will create a simple idio-graphql api using [apollo-server](https://www.apollographql.com/docs/apollo-server/). If you want to get started straight away checkout the [example repo](https://github.com/danstarns/idio-graphql-example)


### Creating your server
1. ```npm install graphql apollo-server idio-graphql```
2. ```mkdir src```
3. ```touch index.js```

**index.js**

```javascript
const { ApolloServer } = require("apollo-server");
const { combineNodes } = require("idio-graphql");

const nodes = require("./nodes/index.js");

(async function Main() {
    try {
        const { typeDefs, resolvers } = await combineNodes(nodes);

        const server = new ApolloServer({ typeDefs, resolvers });

        await server.listen(4000);

        console.log("Listing on localhost:4000/graphql");
    } catch (error) {
        console.error(error);
    }
})();
``` 

4. `mkdir nodes`
5. `cd nodes && touch index.js`

**nodes/index.js**

```javascript 
const User = require("./User/index.js");

module.exports = [User];
```

6. `mkdir User`
7. `cd User && touch index.js`

**nodes/User/index.js**

```javascript
const { GraphQLNode } = require("idio-graphql");

const Query = require("./Query/index.js");
const Mutation = require("./Mutation/index.js");
const Subscription = require("./Subscription/index.js");
const Fields = require("./Fields/index.js");

const User = new GraphQLNode({
    name: "User",
    typeDefs: "./User.gql",
    resolvers: { Query, Mutation, Subscription, Fields }
});

module.exports = User;
```

Using `GraphQLNode` you can supply the resolvers for each root type & the `Fields` object is the resolvers based around the node type. It's suggested keeping each node based purely around 1 type.

**nodes/User/User.gql**

```graphql
type User {
    name: String
    age: Int
    posts: [Post]
    resolvedField: String
}

extend type Query {
    user: User
}

extend type Mutation {
    createUser(name: String age: Int): User
}

extend type Subscription {
    userCreation: User
}
```

`combineNodes` will handle the use of `extend` and if you use `type Query` ect ect, `combineNodes` will throw a error. 


---
## `GraphQLNode`

```
/**
 * @typedef {Object} GraphQLNode
 * @property {string} name - The nodes name.
 * @property {string} typeDefs - Path to the nodes graphql file.
 * @property {Object} resolvers - graphql resolvers
 * @property {Object} resolvers.Query - graphql resolvers.Query
 * @property {Object} resolvers.Mutation - graphql resolvers.Mutation
 * @property {Object} resolvers.Subscription - graphql resolvers.Subscription
 * @property {Object} resolvers.Fields - graphql resolvers.Fields
 */

 /**
 * Creates a instance of a GraphQLNode, should be used as the index to your node.
 *
 * @typedef {Object} GraphQLNode

 * @param {Object} config - An object.
 * @param {string} config.name - The nodes name
 * @param {string} config.typeDefs - Path to the nodes graphql file.
 * @param {{Query: {Object}, Mutation: {Object}, Subscription: {Object}, Fields: {Object} }} config.resolvers - Nodes resolvers.
 * 
 *  @returns GraphQLNode
 */
 ```

 ## `combineNodes`

```
/**
 * @typedef {Object} Schema
 * @property {string} typeDefs - graphql typeDefs
 * @property {Object} resolvers - graphql resolvers
 * @property {Object} resolvers.Query - graphql resolvers.Query
 * @property {Object} resolvers.Mutation - graphql resolvers.Mutation
 * @property {Object} resolvers.Subscription - graphql resolvers.Subscription
 */

/**
 * Combines and returns the combined typeDefs and resolvers, ready to be passed into apollo-server, graphQL-yoga & more.
 *
 * @param {Array.<GraphQLNode>} nodes - Array of type GraphQLNode.
 *
 * @returns {Schema}
 */
 ```


## `graphQLLoader`

```
/**
 * A fancy promise based wrapper around fs.readFile.
 *
 * @param {string} filePath - filePath of graphqlfile.
 *
 * @returns String
 */
```






