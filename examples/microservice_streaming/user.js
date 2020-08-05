/* eslint-disable import/no-extraneous-dependencies */
const { gql } = require("apollo-server");
const util = require("util");
const { GraphQLNode } = require("../../src");

const sleep = util.promisify(setTimeout);

const { users } = require("../data/index.js");

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

        type Subscription {
            userUpdate: User
        }
    `,
    resolvers: {
        Query: {
            user: (root, { id }) => {
                return users.find((x) => x.id === id);
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
