/* eslint-disable import/no-dynamic-require */
const { SOURCE_PATH = "../../src/index.js" } = process.env;
const { expect } = require("chai");

const { GraphQLNode, combineNodes, IdioDirective } = require(SOURCE_PATH);

describe("gists/idio-directive", async () => {
    it("should verify idio-directive", async () => {
        const hasScopeDirective = new IdioDirective({
            name: "hasScope",
            typeDefs: `
                directive @hasScope(scopes: [String]!) on FIELD_DEFINITION
            `,
            resolver: () => true
        });

        const User = new GraphQLNode({
            name: "User",
            typeDefs: `
                type User {
                    id: ID
                    name: String
                    age: Int
                }
                type Query {
                    user(id: ID!): User @hasScope(scopes: ["user:read"])
                }
            `,
            resolvers: {
                Query: {
                    user: () => true
                }
            }
        });

        const { typeDefs, resolvers, schemaDirectives } = await combineNodes(
            [User],
            {
                directives: [hasScopeDirective]
            }
        );

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type User");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type Query");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("directive @hasScope");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("schema");

        expect(resolvers)
            .to.be.a("object")
            .to.have.property("Query")
            .to.be.a("object")
            .to.have.property("user")
            .to.be.a("function");

        expect(schemaDirectives)
            .to.be.a("object")
            .to.have.property("hasScope")
            .to.be.a("function");
    });
});
