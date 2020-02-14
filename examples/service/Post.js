const { gql } = require("apollo-server");
const { GraphQLNode } = require("../../../src/api/index.js");

const posts = [
    { id: "0", title: "Food", likes: ["1", "2"] },
    { id: "1", title: "Beer", likes: ["0"] },
    { id: "2", title: "Coffee", likes: ["1", "2"] }
];

const Post = new GraphQLNode({
    name: "Post",
    injections: {
        abc: "123"
    },
    typeDefs: gql`
        type Post {
            id: String
            title: String
            likes: [User]
        }

        type Query {
            post(id: String!): Post
            posts(ids: [String]): [Post]
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
                        query($ids: [String]) {
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
                    throw result.errors[0];
                }

                return result.data.users;
            }
        }
    }
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
