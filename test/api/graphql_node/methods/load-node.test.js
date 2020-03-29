const { expect } = require("chai");
const loadNode = require("../../../../src/api/graphql_node/methods/load-node.js");

describe("loadNode", () => {
    it("should load a node", () => {
        const node = {
            name: "User",
            typeDefs: `
                type User {
                    name: String
                }

                type Query {
                    user: User
                }
            `,
            resolvers: { Query: { user: () => true } },
            enums: [
                {
                    name: "Status",
                    resolver: () => true,
                    typeDefs: `
                        enum Status {
                            ONLINE
                            OFFLINE
                        }
                    `
                }
            ]
        };

        const loaded = loadNode(node);

        expect(loaded).to.be.a("object");

        const { typeDefs, resolvers } = loaded;

        expect(typeDefs).to.be.a("string").to.contain("enum Status");

        expect(typeDefs).to.be.a("string").to.contain("type User");

        expect(typeDefs).to.be.a("string").to.contain("type Query");

        expect(resolvers).to.be.a("object");

        const {
            Status,
            Query: { user }
        } = resolvers;

        expect(Status).to.be.a("function");
        expect(user).to.be.a("function");
    });
});
