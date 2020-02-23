/* eslint-disable import/no-extraneous-dependencies */
const { gql } = require("apollo-server");
const { GraphQLNode } = require("idio-graphql");
const util = require("util");

const sleep = util.promisify(setTimeout);

const { users } = require("../../data/index.js");

const User = new GraphQLNode({
    name: "User",
    typeDefs: gql`
        type User {
            id: ID
            name: String
            age: Int
            posts: [Post]
        }

        type Query {
            user(id: ID!): User
            users(ids: [ID]): [User]
        }

        type Subscription {
            userUpdate: User
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
                        query($ids: [ID]) {
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
                    throw new Error(result.errors[0].message);
                }

                return result.data.posts;
            }
        },
        Subscription: {
            userUpdate: {
                async *subscribe() {
                    while (true) {
                        // eslint-disable-next-line no-await-in-loop
                        await sleep(1000);

                        yield {
                            userUpdate: {
                                id: "1",
                                name: "Test Subscriptions",
                                age: Math.floor(Math.random() * 20),
                                posts: ["1", "2"]
                            }
                        };
                    }
                }
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
