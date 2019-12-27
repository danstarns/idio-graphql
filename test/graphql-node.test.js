/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-unused-vars */
const { expect } = require("chai");

const { SOURCE_PATH = "src" } = process.env;

const GraphQLNode = require(`../${SOURCE_PATH}/graphql-node.js`);
const IdioEnum = require(`../${SOURCE_PATH}/idio-enum.js`);

describe("GraphQLNode ", () => {
    it("should name required", () => {
        try {
            const node = new GraphQLNode();

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain("GraphQLNode: name required");
        }
    });

    it("should throw name should be a string", () => {
        try {
            const node = new GraphQLNode({ name: [] });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "GraphQLNode: name must be of type 'string'"
            );
        }
    });

    it("should throw typeDefs required", () => {
        try {
            const node = new GraphQLNode({ name: "User" });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "GraphQLNode: creating node: 'User' typeDefs required"
            );
        }
    });

    it("should throw error parsing typeDefs when invalid SDL provided", () => {
        try {
            const node = new GraphQLNode({
                name: "User",
                typeDefs: `
                terp User [
                    name: String
                    age: Int
                ]
            `
            });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "GraphQLNode: creating node: 'User' Error:"
            );
        }
    });

    it("should throw resolvers required", () => {
        try {
            const node = new GraphQLNode({
                name: "User",
                typeDefs: `
                type User {
                    name: String
                    age: Int
                }
                
                type Query {
                    getUserByID(id: ID!): User
                }
            `
            });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "GraphQLNode: creating node: 'User' resolvers required"
            );
        }
    });

    it("should throw resolvers must be of type object", () => {
        try {
            const node = new GraphQLNode({
                name: "User",
                typeDefs: `
                type User {
                    name: String
                    age: Int
                }
                
                type Query {
                    getUserByID(id: ID!): User
                }
            `,
                resolvers: 9999
            });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                `GraphQLNode: expected node: 'User' resolvers to be of type 'object' but recived 'number'`
            );
        }
    });

    it("should throw resolvers recived unexpected properties", () => {
        try {
            const node = new GraphQLNode({
                name: "User",
                typeDefs: `
                type User {
                    name: String
                    age: Int
                }
                
                type Query {
                    getUserByID(id: ID!): User
                }
            `,
                resolvers: {
                    notAllowed: {}
                }
            });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                `GraphQLNode: creating node: 'User' resolvers recived unexpected properties '[ notAllowed ]'`
            );
        }
    });

    it("should create and return a instance of GraphQLNode without enums or nodes", () => {
        const node = new GraphQLNode({
            name: "User",
            typeDefs: `
            type User {
                name: String
                age: Int
            }
            
            type Query {
                getUserByID(id: ID!): User
            }
        `,
            resolvers: {
                Query: {},
                Mutation: {},
                Subscription: {},
                Fields: {}
            }
        });

        expect(node)
            .to.have.property("name")
            .to.be.a("string")
            .to.equal("User");

        expect(node)
            .to.have.property("typeDefs")
            .to.be.a("function");

        expect(node)
            .to.have.property("resolvers")
            .to.be.a("object")
            .to.have.property("Query");

        expect(node)
            .to.have.property("resolvers")
            .to.be.a("object")
            .to.have.property("Mutation");

        expect(node)
            .to.have.property("resolvers")
            .to.be.a("object")
            .to.have.property("Subscription");

        expect(node)
            .to.have.property("resolvers")
            .to.be.a("object")
            .to.have.property("Fields");
    });

    it("should throw enums must be of type array", () => {
        try {
            const node = new GraphQLNode({
                name: "User",
                typeDefs: `
                type User {
                    name: String
                    age: Int
                }
                
                type Query {
                    getUserByID(id: ID!): User
                }
            `,
                resolvers: {
                    Query: {},
                    Mutation: {},
                    Subscription: {},
                    Fields: {}
                },
                enums: {}
            });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                `GraphQLNode: creating node: 'User' enums must be of type 'array'`
            );
        }
    });

    it("should throw enum should be of type IdioEnum", () => {
        try {
            const node = new GraphQLNode({
                name: "User",
                typeDefs: `
                type User {
                    name: String
                    age: Int
                }
                
                type Query {
                    getUserByID(id: ID!): User
                }
            `,
                resolvers: {
                    Query: {},
                    Mutation: {},
                    Subscription: {},
                    Fields: {}
                },
                enums: [{ name: "Status", resolver: () => true }]
            });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                `GraphQLNode: creating node: 'User' expected enum to be instance of IdioEnum`
            );
        }
    });

    it("should create and return a instance of GraphQLNode with enums", () => {
        const StatusEnum = new IdioEnum({
            name: "Status",
            resolver: {},
            typeDefs: `
            enum Status {
                ONLINE
                OFFLINE
            }`
        });

        const node = new GraphQLNode({
            name: "User",
            typeDefs: `
            type User {
                name: String
                age: Int
            }
            
            type Query {
                getUserByID(id: ID!): User
            }
        `,
            resolvers: {
                Query: {},
                Mutation: {},
                Subscription: {},
                Fields: {}
            },
            enums: [StatusEnum]
        });

        expect(node)
            .to.have.property("name")
            .to.be.a("string")
            .to.equal("User");

        expect(node)
            .to.have.property("typeDefs")
            .to.be.a("function");

        expect(node)
            .to.have.property("resolvers")
            .to.be.a("object")
            .to.have.property("Query");

        expect(node)
            .to.have.property("resolvers")
            .to.be.a("object")
            .to.have.property("Mutation");

        expect(node)
            .to.have.property("resolvers")
            .to.be.a("object")
            .to.have.property("Subscription");

        expect(node)
            .to.have.property("resolvers")
            .to.be.a("object")
            .to.have.property("Fields");

        expect(node)
            .to.have.property("enums")
            .to.be.a("array");

        node.enums.forEach((_enum) => {
            expect(_enum).to.be.a.instanceOf(IdioEnum);
        });
    });

    it("should throw nodes must be of type array", () => {
        try {
            const node = new GraphQLNode({
                name: "User",
                typeDefs: `
                type User {
                    name: String
                    age: Int
                }
                
                type Query {
                    getUserByID(id: ID!): User
                }
            `,
                resolvers: {
                    Query: {},
                    Mutation: {},
                    Subscription: {},
                    Fields: {}
                },
                nodes: {}
            });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                `GraphQLNode: creating node: 'User' nodes must be of type 'array'`
            );
        }
    });

    it("should throw node should be of type GraphQLNode", () => {
        try {
            const node = new GraphQLNode({
                name: "User",
                typeDefs: `
                type User {
                    name: String
                    age: Int
                }
                
                type Query {
                    getUserByID(id: ID!): User
                }
            `,
                resolvers: {
                    Query: {},
                    Mutation: {},
                    Subscription: {},
                    Fields: {}
                },
                nodes: [{ name: "Post", resolvers: {}, typeDefs: `` }]
            });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                `GraphQLNode: creating node: 'User' expected node to be instance of GraphQLNode`
            );
        }
    });

    it("should create and return a instance of GraphQLNode with nodes", () => {
        const Post = new GraphQLNode({
            name: "Post",
            resolvers: {},
            typeDefs: `
            type Post {
                title: String
            }
            
            type Query {
                post: Post
            }`
        });

        const node = new GraphQLNode({
            name: "User",
            typeDefs: `
            type User {
                name: String
                age: Int
            }
            
            type Query {
                getUserByID(id: ID!): User
            }
        `,
            resolvers: {
                Query: {},
                Mutation: {},
                Subscription: {},
                Fields: {}
            },
            nodes: [Post]
        });

        expect(node)
            .to.have.property("name")
            .to.be.a("string")
            .to.equal("User");

        expect(node)
            .to.have.property("typeDefs")
            .to.be.a("function");

        expect(node)
            .to.have.property("resolvers")
            .to.be.a("object")
            .to.have.property("Query");

        expect(node)
            .to.have.property("resolvers")
            .to.be.a("object")
            .to.have.property("Mutation");

        expect(node)
            .to.have.property("resolvers")
            .to.be.a("object")
            .to.have.property("Subscription");

        expect(node)
            .to.have.property("resolvers")
            .to.be.a("object")
            .to.have.property("Fields");

        expect(node)
            .to.have.property("nodes")
            .to.be.a("array");

        node.nodes.forEach((_node) => {
            expect(_node).to.be.a.instanceOf(GraphQLNode);
        });
    });

    it("should throw node has a invalid name", () => {
        try {
            const node = new GraphQLNode({
                name: "Query",
                typeDefs: `
                type Query {
                    method: String
                }`,
                resolvers: {}
            });

            throw new Error();
        } catch (error) {
            expect(error.message).contain(
                "GraphQLNode: creating node 'Query' with invalid name"
            );
        }
    });

    it("should throw node has a invalid name", () => {
        try {
            const node = new GraphQLNode({
                name: "subscription",
                typeDefs: `
                type subscription {
                    method: String
                }`,
                resolvers: {}
            });

            throw new Error();
        } catch (error) {
            expect(error.message).contain(
                "GraphQLNode: creating node 'subscription' with invalid name"
            );
        }
    });
});
