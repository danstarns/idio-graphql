const { expect } = require("chai");

const { GraphQLNode, combineNodes } = require("../../src");

describe("gists/nested-nodes", () => {
    it("should verify nested-nodes", () => {
        const User = new GraphQLNode({
            name: "User",
            typeDefs: `
            type User {
                id: ID
                name: String
                age: Int
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

        const Comment = new GraphQLNode({
            name: "Comment",
            typeDefs: `
            type Comment {
                id: ID
                content: String
                User: User
            }
            type Query {
                comment(id: ID!): Comment
            }
        `,
            resolvers: {
                Query: {
                    comment: () => true
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
                comments: [Comment]
            }
            type Query {
                post(id: ID!): Post
            }
        `,
            resolvers: {
                Query: {
                    post: () => true
                }
            },
            nodes: [Comment]
        });

        const { typeDefs, resolvers } = combineNodes([User, Post]);

        expect(typeDefs).to.be.a("string");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type User");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type Post");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type Comment");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type Query");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("schema");

        expect(resolvers).to.be.a("object");

        expect(resolvers.Query).to.be.a("object");

        expect(resolvers.Query)
            .to.be.a("object")
            .to.have.property("user")
            .to.be.a("function");

        expect(resolvers.Query)
            .to.be.a("object")
            .to.have.property("post")
            .to.be.a("function");

        expect(resolvers.Query)
            .to.be.a("object")
            .to.have.property("comment")
            .to.be.a("function");
    });
});
