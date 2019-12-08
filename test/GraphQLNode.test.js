/* eslint-disable no-unused-vars */
const { expect } = require("chai");
const path = require("path");
const { GraphQLNode } = require("../src/index.js");
const IdioEnum = require("../src/IdioEnum");

describe("GraphQLNode", () => {
    it("should throw name required", () => {
        try {
            const node = new GraphQLNode();
        } catch (error) {
            expect(error.message).to.equal("GraphQLNode: name required");
        }
    });

    it("should throw name must be of type string", () => {
        try {
            const node = new GraphQLNode({ name: [] });
        } catch (error) {
            expect(error.message).to.equal(
                "GraphQLNode: name must be of type 'string'"
            );
        }
    });

    it("should throw typeDefs required", () => {
        try {
            const node = new GraphQLNode({ name: "User" });
        } catch (error) {
            expect(error.message).to.equal("GraphQLNode: typeDefs required");
        }
    });

    it("should throw typeDefs must be type string", () => {
        try {
            const node = new GraphQLNode({ name: "User", typeDefs: [] });
        } catch (error) {
            expect(error.message).to.equal(
                "GraphQLNode: name must be of type 'string'"
            );
        }
    });

    it("should throw creating node without resolvers", () => {
        try {
            const node = new GraphQLNode({
                name: "User",
                typeDefs: "./User.gql"
            });
        } catch (error) {
            expect(error.message).to.equal(
                "GraphQLNode: creating node: 'User' without resolvers"
            );
        }
    });

    it("should throw expected resolvers to be an Object", () => {
        try {
            const node = new GraphQLNode({
                name: "User",
                typeDefs: "./User.gql",
                resolvers: "empty"
            });
        } catch (error) {
            expect(error.message)
                .to.be.a("string")
                .to.contain(
                    "GraphQLNode: expected node: 'User' resolvers to be of type 'Object' but recived"
                );
        }
    });

    it("should throw typeDefs path dont exist", () => {
        try {
            const node = new GraphQLNode({
                name: "User",
                typeDefs: "./random/path.gql",
                resolvers: {
                    Query: {}
                }
            });
        } catch (error) {
            expect(error.message).to.equal(
                `GraphQLNode: typeDefs path '${path.normalize(
                    `${__dirname}/random/path.gql`
                )}' does not exist`
            );
        }
    });

    it("should throw enums must be of type array", (done) => {
        try {
            const node = new GraphQLNode({
                name: "User",
                typeDefs: "./dummy-data/Post.gql",
                resolvers: {
                    Query: {}
                },
                enums: {}
            });
        } catch (error) {
            expect(error.message).to.contain("enums must be of type array");

            done();
        }
    });

    it("should throw expected enum to be of type IdioEnum", (done) => {
        try {
            const node = new GraphQLNode({
                name: "User",
                typeDefs: "./dummy-data/Post.gql",
                resolvers: {
                    Query: {}
                },
                enums: [
                    {
                        name: "name",
                        typeDefs: "./dummy-data/Pets-Enum.gql",
                        resolver: () => true
                    }
                ]
            });
        } catch (error) {
            expect(error.message).to.contain(
                "expected enum to be instance of IdioEnum"
            );

            done();
        }
    });

    it("should return a instance of GraphQLNode", () => {
        const petEnum = new IdioEnum({
            name: "Pets",
            typeDefs: "./dummy-data/Pets-Enum.gql",
            resolver: () => true
        });

        const node = new GraphQLNode({
            name: "User",
            typeDefs: "./dummy-data/User.gql",
            resolvers: { Query: {} },
            enums: [petEnum]
        });

        expect(node).to.be.a("object");

        expect(node)
            .to.have.property("name")
            .to.be.a("string");

        expect(node)
            .to.have.property("typeDefs")
            .to.be.a("string");

        expect(node)
            .to.have.property("resolvers")
            .to.be.a("object");

        expect(node)
            .to.have.property("enums")
            .to.be.a("array");
    });

    it("should return a instance of GraphQLNode with real path", () => {
        const node = new GraphQLNode({
            name: "User",
            typeDefs: path.normalize(
                path.join(__dirname, "dummy-data", "User.gql")
            ),
            resolvers: { Query: {} }
        });

        expect(node).to.be.a("object");

        expect(node)
            .to.have.property("name")
            .to.be.a("string");

        expect(node)
            .to.have.property("typeDefs")
            .to.be.a("string");

        expect(node)
            .to.have.property("resolvers")
            .to.be.a("object");
    });
});
