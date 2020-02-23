const { gql } = require("apollo-server");
const { GraphQLNode } = require("idio-graphql");

const { users } = require("../../data/index.js");

const User = new GraphQLNode({
    name: "User",
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
                    throw new Error(result.errors[0].message);
                }

                return result.data.posts;
            }
        }
    }
});

module.exports = User;
