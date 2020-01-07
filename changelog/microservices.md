# Introducing idio-microservices


**User.service**
```javascript
const User = new GraphQLNode({
    name: "User",
    typeDefs: `
        type User {
            id: Int
            name: String
            age: Int
            posts: [Post]
        }
        
        type Query {
            users: [User]
        }
    `,
    resolvers: {
        Query: {
            users: () => { // return users }
        },
        Fields: {
            posts: () => { // join posts }
        }
    },
});

User.serve({
    transporter: "redis://localhost:6379",
    logLevel: "info"
}).then(() => {
    console.log("User online.");
});
```

**Post.service**
```javascript
const Post = new GraphQLNode({
    name: "Post",
    typeDefs: `
    type Post {
        id: Int
        title: String
    }

    type Query {
        posts: [Post]
    }
    `,
    resolvers: {
        Query: {
            posts: () => { /* return posts */ }
        }
    },
});

Post.serve({
    transporter: "redis://localhost:6379",
    logLevel: "info"
}).then(() => {
    console.log("Post online.");
});
```

**gateway**
```javascript
async function main() {
    const gateway = new GraphQLGateway(
        { dependencies: ["Post", "User"] },
        { transporter: "redis://localhost:6379", logLevel: "info" }
    );

    const { typeDefs, resolvers, broker } = await gateway.start();

    const server = new ApolloServer({ typeDefs, resolvers });

    await server.listen(5000);

    console.log("Server online: http://localhost:5000/graphql");
}

main();
```