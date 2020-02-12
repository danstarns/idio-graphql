const { gql } = require("apollo-server");
const { GraphQLNode } = require("../../../../src/api/index.js");

const users = [
    { id: "0", name: "Bob", age: 3, posts: ["0"] },
    { id: "1", name: "Jane", age: 13, posts: ["1", "2"] },
    { id: "2", name: "Will", age: 23, posts: ["2"] }
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
            users(ids: String): [User]
        }
    `,
    resolvers: {
        Query: {
            user: (root, { id }) => {
                return users.find((x) => x.id === id);
            },
            users: (root, { ids }) => {
                if (ids) {
                    return users.find((x) => ids.includes(x.id));
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

module.exports = User;
