# IdioGraphQL Examples:


This section contains lots of micro applications demonstrating the capability's of idio-graphql. 


1. **Local** -  The application is demonstrating ways to use idio-graphql within the same process.
2. **Service** -  The application is demonstrating ways to use idio-graphql across multiple process.

> Service applications will require running [NATS](https://nats.io/) server.

Each service will start a graphql playground using [ApolloServer](https://www.apollographql.com/docs/apollo-server/). You will be able to query against, either or a subset of, the following GraphQL schema. 

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
    likes: [User]
}
```

# Applications
>  Go to your desired Applications README.

1. Local
2. Service
3. Directives
    * Local
    * Service
4.