const { gql } = require("apollo-server");
const { GraphQLNode } = require("../../../src/api/index.js");

const users = [
    { id: "0", name: "Bob", age: 3 },
    { id: "1", name: "Jane", age: 13 },
    { id: "2", name: "Will", age: 23 }
];

const User = new GraphQLNode({
    name: "User",
    typeDefs: gql`
        type User {
            name: String
            age: Int
        }

        type Query {
            user(id: ID!): User
            users: [User]
        }
    `,
    resolvers: {
        Query: {
            user: (root, { id }) => {
                return users.find((x) => x.id === id);
            },
            users: () => users
        }
    }
});

async function main() {
    try {
        await User.serve({
            gateway: "accounts_gateway",
            transporter: "NATS",
            logLevel: "info",
            heartbeatInterval: 3,
            heartbeatTimeout: 5
        });

        console.log("User Online");
    } catch (error) {
        console.error(error);

        process.exit(1);
    }
}

main();
