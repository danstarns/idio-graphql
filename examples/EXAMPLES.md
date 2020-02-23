# idio-graphql examples:

This section contains lots of micro applications demonstrating the capability's of idio-graphql. 

>  Go to your desired Applications README.

1. [Local](https://github.com/danstarns/idio-graphql/blob/master/examples/local/README.md) - This project showcase's the most basic local setup with idio-graphql.
2. [Microservice](https://github.com/danstarns/idio-graphql/blob/master/examples/microservice/README.md) - This project showcase's the most basic microservice setup with idio-graphql.
3. [Gradual Adoption](https://github.com/danstarns/idio-graphql/blob/master/examples/gradual_adoption/README.md) - This project demonstrates how to gradually adopt a microservices architecture with idio-graphql.

Each service will start a graphql playground on http://localhost:4000/graphql using [ApolloServer](https://www.apollographql.com/docs/apollo-server/). You will be able to query against, either or a subset of, the following GraphQL schema. 

```graphql
type User {
    id: ID
    name: String
    age: Int
    posts: [Post]
}

type Post {
    id: ID
    title: String
    likes: [User]
    comments: [Comment]
}

type Comment {
    id: ID
    content: String
    user: User
}
```
