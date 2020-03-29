const { expect } = require("chai");

const { GraphQLNode, combineNodes } = require("../../src");

describe("gists/idio-scalar", async () => {
    it("should schema globals", async () => {
        const User = new GraphQLNode({
            name: "User",
            typeDefs: `
                type User {
                    id: ID
                    name: String
                    age: Int
                    timeStamps: TimeStamp
                }
                type Query {
                    user(id: ID!): User
                }
            `,
            resolvers: {
                Query: {
                    user: () => true
                }
            }
        });

        const Post = new GraphQLNode({
            name: "Post",
            typeDefs: `
                type Post {
                    id: ID
                    title: String
                    content: Int
                    timeStamps: TimeStamp
                }
                type Query {
                    post(id: ID!): Post
                }
            `,
            resolvers: {
                Query: {
                    post: () => true
                }
            }
        });

        const { typeDefs, resolvers } = await combineNodes([User, Post], {
            schemaGlobals: [
                `
                    type TimeStamp {
                        createdAt: String
                        updatedAt: String
                    }
                `
            ]
        });

        expect(typeDefs).to.be.a("string").to.contain("type User");

        expect(typeDefs).to.be.a("string").to.contain("type Post");

        expect(typeDefs).to.be.a("string").to.contain("type TimeStamp");

        expect(typeDefs).to.be.a("string").to.contain("type Query");

        expect(typeDefs).to.be.a("string").to.contain("schema");

        expect(resolvers)
            .to.be.a("object")
            .to.have.property("Query")
            .to.be.a("object")
            .to.have.property("user")
            .to.be.a("function");

        expect(resolvers)
            .to.be.a("object")
            .to.have.property("Query")
            .to.be.a("object")
            .to.have.property("post")
            .to.be.a("function");
    });
});
