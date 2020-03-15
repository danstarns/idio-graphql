/* eslint-disable import/no-extraneous-dependencies */
const { gql } = require("apollo-server");
const { GraphQLNode } = require("../../../../../src");

const { comments } = require("../../../../data/index.js");

const Comment = new GraphQLNode({
    name: "Comment",
    typeDefs: gql`
        type Comment {
            id: ID
            content: String
            user: User
        }

        type Query {
            comment(id: ID!): Comment
            comments(ids: [ID]): [Comment]
        }
    `,
    resolvers: {
        Query: {
            comment: (root, { id }) => {
                return comments.find((x) => x.id === id);
            },
            comments: (root, { ids }) => {
                if (ids) {
                    return comments.filter((x) => ids.includes(x.id));
                }

                return comments;
            }
        },
        Fields: {
            user: async (root, args, { injections }) => {
                const result = await injections.execute(
                    gql`
                        query($id: ID!) {
                            user(id: $id) {
                                id
                                name
                                age
                            }
                        }
                    `,
                    {
                        variables: {
                            id: root.user.id
                        }
                    }
                );

                if (result.errors) {
                    throw new Error(result.errors[0].message);
                }

                return result.data.user;
            }
        }
    }
});

module.exports = Comment;
