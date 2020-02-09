const { gql } = require("apollo-server");
const { GraphQLNode } = require("../../../src/api/index.js");

const users = [
    { id: "0", name: "Bob", age: 3, post: ["0"] },
    { id: "1", name: "Jane", age: 13, post: ["1", "2"] },
    { id: "2", name: "Will", age: 23, post: ["2"] }
];

const User = new GraphQLNode({
    name: "User",
    injections: {
        abc: "123"
    },
    typeDefs: gql`
        type User {
            id: String
            name: String
            age: Int
            posts: [Post]
        }

        type Query {
            user(id: String!): User
            users(ids: [String]): [User]
        }
    `,
    resolvers: {
        Query: {
            user: (root, { id }) => {
                return users.find((x) => x.id === id);
            },
            users: (root, { ids }) => {
                if (ids) {
                    return users.filter((x) => ids.includes(x.id));
                }

                return users;
            }
        },
        Fields: {
            posts: async (root, args, { injections }) => {
                const result = await injections.execute(
                    gql`
                        query($ids: [String]) {
                            posts(ids: $ids) {
                                id
                                title
                            }
                        }
                    `,
                    {
                        variables: {
                            ids: root.posts
                        }
                    }
                );

                if (result.errors) {
                    throw result.errors;
                }

                return result.data.posts;
            }
        }
    }
});

async function main() {
    try {
        await User.serve({
            gateway: "gateway",
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
