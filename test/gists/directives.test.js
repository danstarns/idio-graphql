const { expect } = require("chai");
const isAuthenticated = require("../dummy-data/directive.js");
const { GraphQLNode, combineNodes, IdioDirective } = require("../../src");

describe("gists/idio-directive", () => {
    it("should verify idio-directive", () => {
        const hasScopeDirective = new IdioDirective({
            name: "hasScope",
            typeDefs: `
                directive @hasScope(scopes: [String]!) on FIELD_DEFINITION
            `,
            resolver: isAuthenticated
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

        const { typeDefs, resolvers, schemaDirectives } = combineNodes([User], {
            directives: [hasScopeDirective]
        });

        expect(typeDefs).to.be.a("string").to.contain("type User");

        expect(typeDefs).to.be.a("string").to.contain("type Query");

        expect(typeDefs).to.be.a("string").to.contain("directive @hasScope");

        expect(typeDefs).to.be.a("string").to.contain("schema");

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
