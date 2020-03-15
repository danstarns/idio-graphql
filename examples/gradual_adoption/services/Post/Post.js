/* eslint-disable import/no-extraneous-dependencies */
const { gql } = require("apollo-server");
const { GraphQLNode } = require("../../../../src");

const { posts } = require("../../../data/index.js");
const Comment = require("./nodes/Comment.js");

const Post = new GraphQLNode({
    name: "Post",
    typeDefs: gql`
        type Post {
            id: ID
            title: String
            likes: [User]
            comments: [Comment]
        }

        type Query {
            post(id: ID!): Post
            posts(ids: [ID]): [Post]
        }
    `,
    resolvers: {
        Query: {
            post: (root, { id }) => {
                return posts.find((x) => x.id === id);
            },
            posts: (root, { ids }) => {
                if (ids) {
                    return posts.filter((x) => ids.includes(x.id));
                }

                return posts;
            }
        },
        Fields: {
            likes: async (root, args, { injections }) => {
                const result = await injections.execute(
                    gql`
                        query($ids: [ID]) {
                            users(ids: $ids) {
                                id
                                name
                                age
                            }
                        }
                    `,
                    {
                        variables: {
                            ids: root.likes
                        }
                    }
                );

                if (result.errors) {
                    throw new Error(result.errors[0].message);
                }

                return result.data.users;
            },
            comments: async (root, args, { injections }) => {
                const result = await injections.execute(
                    gql`
                        query($ids: [ID]) {
                            comments(ids: $ids) {
                                id
                                content
                                user {
                                    id
                                }
                            }
                        }
                    `,
                    {
                        variables: {
                            ids: root.comments
                        }
                    }
                );

                if (result.errors) {
                    throw new Error(result.errors[0].message);
                }

                return result.data.comments;
            }
        }
    },
    nodes: [Comment]
});

async function main() {
    try {
        await Post.serve({
            gateway: "gateway",
            transporter: "NATS",
            logLevel: "info",
            heartbeatInterval: 3,
            heartbeatTimeout: 5
        });

        console.log("Post Online");
    } catch (error) {
        console.error(error);

        process.exit(1);
    }
}

main();
