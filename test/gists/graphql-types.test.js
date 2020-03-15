const { expect } = require("chai");

const { GraphQLNode, combineNodes, GraphQLType } = require("../../src");

describe("gists/GraphQLTypes", () => {
    it("should verify GraphQLType", async () => {
        const Metadata = new GraphQLType({
            name: "Metadata",
            injections: {
                test: true
            },
            typeDefs: `
            type Metadata {
                lastLogin: String
            }
        `,
            resolvers: {
                lastLogin: (root, args, { injections: { test } }) => {
                    expect(test).to.equal(true);

                    return new Date().toISOString();
                }
            }
        });

        const User = new GraphQLNode({
            name: "User",
            typeDefs: `
            type User {
                name: String
                age: Int
                metadata: Metadata
            }

            type Query {
                user: User
            }
        `,
            resolvers: {
                Query: {
                    user: () => ({ name: "Daniel", age: 20 })
                }
            },
            types: [Metadata]
        });

        const { typeDefs, resolvers } = combineNodes([User]);

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type User");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type Metadata");

        const user = await resolvers.Query.user();

        const { name, age } = user;

        expect(name)
            .to.be.a("string")
            .to.contain("Daniel");

        expect(age)
            .to.be.a("number")
            .to.equal(20);

        const lastLogin = await resolvers.Metadata.lastLogin();

        expect(lastLogin).to.be.a("string");
    });
});
