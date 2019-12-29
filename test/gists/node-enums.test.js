/* eslint-disable import/no-dynamic-require */
const { SOURCE_PATH = "../../src/index.js" } = process.env;
const { expect } = require("chai");

const { GraphQLNode, combineNodes, IdioEnum } = require(SOURCE_PATH);

describe("gists/node-enums", async () => {
    it("should verify node-enums", async () => {
        const StatusEnum = new IdioEnum({
            name: "Status",
            typeDefs: `
                enum Status {
                    ONLINE
                    OFFLINE
                }
            `,
            resolver: {
                ONLINE: "online",
                OFFLINE: "offline"
            }
        });

        const User = new GraphQLNode({
            name: "User",
            typeDefs: `
                type User {
                    id: ID
                    name: String
                    age: Int
                    status: Status
                }
                type Query {
                    user(id: ID!): User
                }
            `,
            resolvers: {
                Query: {
                    user: () => true
                }
            },
            enums: [StatusEnum]
        });

        const { typeDefs, resolvers } = await combineNodes([User]);

        expect(typeDefs).to.be.a("string");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type User");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type Query");

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
            .to.have.property("Status")
            .to.be.a("Object");
    });
});
