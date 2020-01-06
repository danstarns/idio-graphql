const { expect } = require("chai");

const { GraphQLNode, combineNodes, IdioScalar } = require("../../src");

describe("gists/idio-scalar", async () => {
    it("should verify idio-scalar", async () => {
        const JSONScalar = new IdioScalar({
            name: "JSON",
            resolver: () => true
        });

        const User = new GraphQLNode({
            name: "User",
            typeDefs: `
                type User {
                    id: ID
                    name: String
                    age: Int
                    data: JSON
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

        const { typeDefs, resolvers } = await combineNodes([User], {
            scalars: [JSONScalar]
        });

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type User");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type Query");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("scalar JSON");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("schema");

        expect(resolvers)
            .to.be.a("object")
            .to.have.property("Query")
            .to.be.a("object")
            .to.have.property("user")
            .to.be.a("function");

        expect(resolvers)
            .to.be.a("object")
            .to.have.property("JSON");
    });
});
