const { expect } = require("chai");
const {
    combineNodes,
    GraphQLNode,
    IdioEnum,
    IdioScalar,
    IdioDirective
} = require("../src/index.js");

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

    it("should throw expected scalars to be an array", async () => {
        try {
            const UserNode = new GraphQLNode({
                name: "User",
                typeDefs: "./dummy-data/User-extend-full.gql",
                resolvers: {
                    Query: { user: () => ({ name: "Dan", age: 20, posts: [] }) }
                }
            });

            await combineNodes([UserNode], {
                scalars: {}
            });
        } catch (error) {
            expect(error.message).to.contain("expected scalars to be an array");
        }
    });

    it("should throw expected scalar to be of type IdioScalar", async () => {
        try {
            const UserNode = new GraphQLNode({
                name: "User",
                typeDefs: "./dummy-data/User-extend-full.gql",
                resolvers: {
                    Query: { user: () => ({ name: "Dan", age: 20, posts: [] }) }
                }
            });

            await combineNodes([UserNode], {
                scalars: [{ name: "JSON", resolver: () => true }]
            });
        } catch (error) {
            expect(error.message).to.contain(
                "expected scalar to be of type IdioScalar"
            );
        }
    });

    it("should return typeDefs and resolvers & add scalars", async () => {
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

        const jsonScalar = new IdioScalar({
            name: "JSON",
            resolver: () => true
        });

        const { resolvers, typeDefs } = await combineNodes(
            [UserNode, PostNode],
            { scalars: [jsonScalar] }
        );

        expect(resolvers).to.be.a("object");

        expect(resolvers)
            .to.have.property("Query")
            .to.be.a("object");

        expect(resolvers).to.have.property("JSON");

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

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("scalar JSON");
    });

    it("should throw expected enums to be an array", async () => {
        try {
            const UserNode = new GraphQLNode({
                name: "User",
                typeDefs: "./dummy-data/User-extend-full.gql",
                resolvers: {
                    Query: { user: () => ({ name: "Dan", age: 20, posts: [] }) }
                }
            });

            await combineNodes([UserNode], {
                enums: {}
            });
        } catch (error) {
            expect(error.message).to.contain("expected enums to be an array");
        }
    });

    it("should throw expected enum to be of type IdioEnum", async () => {
        try {
            const UserNode = new GraphQLNode({
                name: "User",
                typeDefs: "./dummy-data/User-extend-full.gql",
                resolvers: {
                    Query: { user: () => ({ name: "Dan", age: 20, posts: [] }) }
                }
            });

            await combineNodes([UserNode], {
                enums: [
                    {
                        name: "JSON",
                        typeDefs: "./dummy-data/Pets-Enum.gql",
                        resolver: () => true
                    }
                ]
            });
        } catch (error) {
            expect(error.message).to.contain(
                "expected enum to be of type IdioEnum"
            );
        }
    });

    it("should return typeDefs and resolvers & add enums", async () => {
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

        const petEnum = new IdioEnum({
            name: "Pets",
            typeDefs: "./dummy-data/Pets-Enum.gql",
            resolver: () => true
        });

        const { resolvers, typeDefs } = await combineNodes(
            [UserNode, PostNode],
            { enums: [petEnum] }
        );

        expect(resolvers).to.be.a("object");

        expect(resolvers)
            .to.have.property("Query")
            .to.be.a("object");

        expect(resolvers).to.have.property("Pets");

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

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("enum Pets");
    });

    it("should return typeDefs and resolvers & add enums from the node", async () => {
        const UserNode = new GraphQLNode({
            name: "User",
            typeDefs: "./dummy-data/User-extend-full.gql",
            resolvers: {
                Query: { user: () => ({ name: "Dan", age: 20, posts: [] }) }
            }
        });

        const petEnum = new IdioEnum({
            name: "Pets",
            typeDefs: "./dummy-data/Pets-Enum.gql",
            resolver: () => true
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
            },
            enums: [petEnum]
        });

        const { resolvers, typeDefs } = await combineNodes([
            UserNode,
            PostNode
        ]);

        expect(resolvers).to.be.a("object");

        expect(resolvers)
            .to.have.property("Query")
            .to.be.a("object");

        expect(resolvers).to.have.property("Pets");

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

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("enum Pets");
    });

    it("should throw if node is not a instance of GraphQLNode", async () => {
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

    it("should throw expected directives to be an array", async () => {
        try {
            const UserNode = new GraphQLNode({
                name: "User",
                typeDefs: "./dummy-data/User-extend-full.gql",
                resolvers: {
                    Query: { user: () => ({ name: "Dan", age: 20, posts: [] }) }
                }
            });

            await combineNodes([UserNode], { directives: {} });
        } catch (error) {
            expect(error.message).to.contain(
                "expected directives to be an array"
            );
        }
    });

    it("should throw expected directive to be of type IdioDirective", async () => {
        try {
            const UserNode = new GraphQLNode({
                name: "User",
                typeDefs: "./dummy-data/User-extend-full.gql",
                resolvers: {
                    Query: { user: () => ({ name: "Dan", age: 20, posts: [] }) }
                }
            });

            await combineNodes([UserNode], {
                directives: [
                    {
                        name: "hasPermission",
                        resolver: {},
                        typeDefs: "./dummy-data/Auth-directive.gql"
                    }
                ]
            });
        } catch (error) {
            expect(error.message).to.contain(
                "expected directive to be of type IdioDirective"
            );
        }
    });

    it("should append and return schemaDirectives", async () => {
        const UserNode = new GraphQLNode({
            name: "User",
            typeDefs: "./dummy-data/User-extend-full.gql",
            resolvers: {
                Query: { user: () => ({ name: "Dan", age: 20, posts: [] }) }
            }
        });

        const hasPermissionDirective = new IdioDirective({
            name: "hasPermission",
            typeDefs: "./dummy-data/Auth-directive.gql",
            resolver: () => true
        });

        const petEnum = new IdioEnum({
            name: "Pets",
            typeDefs: "./dummy-data/Pets-Enum.gql",
            resolver: () => true
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
            },
            enums: [petEnum]
        });

        const { resolvers, typeDefs, schemaDirectives } = await combineNodes(
            [UserNode, PostNode],
            { directives: [hasPermissionDirective] }
        );

        expect(schemaDirectives).to.be.a("object");

        expect(schemaDirectives).to.have.property("hasPermission");

        expect(resolvers).to.be.a("object");

        expect(resolvers)
            .to.have.property("Query")
            .to.be.a("object");

        expect(resolvers).to.have.property("Pets");

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

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("enum Pets");

        expect(typeDefs)
            .to.be.an("string")
            .to.contain("directive @hasPermission");
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
