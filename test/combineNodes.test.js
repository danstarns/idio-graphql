const { expect } = require("chai");
const { combineNodes, GraphQLNode } = require("../src/index.js");

describe("combineNodes", () => {
    it("should throw nodes required", async () => {
        try {
            await combineNodes();
        } catch (error) {
            expect(error.message).to.equal("combineNodes: nodes required");
        }
    });

    it("should throw expected nodes to be of type array", async () => {
        try {
            await combineNodes({});
        } catch (error) {
            expect(error.message)
                .to.be.a("string")
                .to.contain(
                    "combineNodes: expected nodes to be of type array recived"
                );
        }
    });

    it("should return typeDefs and resolvers & convert first node from extend type Query to type Query", async () => {
        const UserNode = new GraphQLNode({
            name: "User",
            typeDefs: "./dummy-data/User.gql",
            resolvers: {
                Query: { user: () => ({ name: "Dan", age: 20, posts: [] }) }
            }
        });

        const PostNode = new GraphQLNode({
            name: "Post",
            typeDefs: "./dummy-data/Post.gql",
            resolvers: {
                Query: {
                    post: () => ({
                        title: "title",
                        content: "blabla",
                        likes: [],
                        user: {}
                    })
                }
            }
        });

        const { resolvers, typeDefs } = await combineNodes([
            UserNode,
            PostNode
        ]);

        expect(resolvers).to.be.a("object");

        expect(resolvers)
            .to.have.property("Query")
            .to.be.a("object");

        expect(resolvers.Query)
            .to.have.property("user")
            .to.be.a("function");

        expect(resolvers.Query)
            .to.have.property("post")
            .to.be.a("function");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type Query");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("extend type Query");
    });

    it("should return resolvers and typedefs even if gql file dont contain extend or type root", async () => {
        const UserNode = new GraphQLNode({
            name: "User",
            typeDefs: "./dummy-data/User-empty.gql",
            resolvers: {
                Query: { user: () => ({ name: "Dan", age: 20, posts: [] }) }
            }
        });

        const { resolvers, typeDefs } = await combineNodes([UserNode]);

        expect(resolvers).to.be.a("object");

        expect(resolvers)
            .to.have.property("Query")
            .to.be.a("object");

        expect(resolvers.Query)
            .to.have.property("user")
            .to.be.a("function");

        expect(typeDefs).to.be.a("string");
        expect(typeDefs).to.be.a("string");
    });

    it("should return typeDefs and resolvers & convert first node from extend type Mutation to type Mutation", async () => {
        const UserNode = new GraphQLNode({
            name: "User",
            typeDefs: "./dummy-data/User-extend-Mutation.gql",
            resolvers: {
                Mutation: { user: () => ({ name: "Dan", age: 20, posts: [] }) }
            }
        });

        const PostNode = new GraphQLNode({
            name: "Post",
            typeDefs: "./dummy-data/Post.gql",
            resolvers: {
                Query: {
                    post: () => ({
                        title: "title",
                        content: "blabla",
                        likes: [],
                        user: {}
                    })
                }
            }
        });

        const { resolvers, typeDefs } = await combineNodes([
            UserNode,
            PostNode
        ]);

        expect(resolvers).to.be.a("object");

        expect(resolvers)
            .to.have.property("Query")
            .to.be.a("object");

        expect(resolvers)
            .to.have.property("Mutation")
            .to.be.a("object");

        expect(resolvers.Query)
            .to.have.property("post")
            .to.be.a("function");

        expect(resolvers.Mutation)
            .to.have.property("user")
            .to.be.a("function");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type Mutation");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("extend type Query");
    });

    it("should return typeDefs and resolvers & convert first node extends from extend to type", async () => {
        const UserNode = new GraphQLNode({
            name: "User",
            typeDefs: "./dummy-data/User-extend-full.gql",
            resolvers: {
                Query: { user: () => ({ name: "Dan", age: 20, posts: [] }) }
            }
        });

        const PostNode = new GraphQLNode({
            name: "Post",
            typeDefs: "./dummy-data/Post.gql",
            resolvers: {
                Query: {
                    post: () => ({
                        title: "title",
                        content: "blabla",
                        likes: [],
                        user: {}
                    })
                }
            }
        });

        const { resolvers, typeDefs } = await combineNodes([
            UserNode,
            PostNode
        ]);

        expect(resolvers).to.be.a("object");

        expect(resolvers)
            .to.have.property("Query")
            .to.be.a("object");

        expect(resolvers.Query)
            .to.have.property("user")
            .to.be.a("function");

        expect(resolvers.Query)
            .to.have.property("post")
            .to.be.a("function");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type Query");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type Mutation");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type Subscription");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("extend type Query");
    });

    it("should throw if node in not a instance of GraphQLNode", async () => {
        try {
            const fakeNode = {
                name: "User",
                typeDefs: "./dummy-data/User.gql",
                resolvers: {
                    Query: {}
                }
            };

            await combineNodes([fakeNode]);
        } catch (error) {
            expect(error.message).to.contain(
                "recived node not a instance of GraphQLNode"
            );
        }
    });

    it("should throw contains type Query replace with extend", async () => {
        try {
            const UserNode = new GraphQLNode({
                name: "User",
                typeDefs: "./dummy-data/User-type-Query.gql",
                resolvers: {
                    Query: { user: () => ({ name: "Dan", age: 20, posts: [] }) }
                }
            });

            const PostNode = new GraphQLNode({
                name: "Post",
                typeDefs: "./dummy-data/Post.gql",
                resolvers: {
                    Query: {
                        post: () => ({
                            title: "title",
                            content: "blabla",
                            likes: [],
                            user: {}
                        })
                    }
                }
            });

            await combineNodes([UserNode, PostNode]);
        } catch (error) {
            expect(error.message).to.equal(
                `combineNodes: User contains: "type Query" replace with "extend type Query"`
            );
        }
    });

    it("should throw contains type Mutation replace with extend", async () => {
        try {
            const UserNode = new GraphQLNode({
                name: "User",
                typeDefs: "./dummy-data/User-type-Mutation.gql",
                resolvers: {
                    Mutation: {
                        user: () => ({ name: "Dan", age: 20, posts: [] })
                    }
                }
            });

            const PostNode = new GraphQLNode({
                name: "Post",
                typeDefs: "./dummy-data/Post.gql",
                resolvers: {
                    Query: {
                        post: () => ({
                            title: "title",
                            content: "blabla",
                            likes: [],
                            user: {}
                        })
                    }
                }
            });

            await combineNodes([UserNode, PostNode]);
        } catch (error) {
            expect(error.message).to.equal(
                `combineNodes: User contains: "type Mutation" replace with "extend type Mutation"`
            );
        }
    });

    it("should throw contains type Subscription replace with extend", async () => {
        try {
            const UserNode = new GraphQLNode({
                name: "User",
                typeDefs: "./dummy-data/User-type-Subscription.gql",
                resolvers: {
                    Subscription: {
                        user: {
                            subscribe: () => ({
                                name: "Dan",
                                age: 20,
                                posts: []
                            })
                        }
                    }
                }
            });

            const PostNode = new GraphQLNode({
                name: "Post",
                typeDefs: "./dummy-data/Post.gql",
                resolvers: {
                    Query: {
                        post: () => ({
                            title: "title",
                            content: "blabla",
                            likes: [],
                            user: {}
                        })
                    }
                }
            });

            await combineNodes([UserNode, PostNode]);
        } catch (error) {
            expect(error.message).to.equal(
                `combineNodes: User contains: "type Subscription" replace with "extend type Subscription"`
            );
        }
    });
});
