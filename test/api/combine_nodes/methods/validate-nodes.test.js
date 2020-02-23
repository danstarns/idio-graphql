const { expect } = require("chai");
const proxyquire = require("proxyquire");

function GraphQLNode({ name }) {
    this.name = name;
}

const validateNodes = proxyquire(
    "../../../../src/api/combine_nodes/methods/validate-nodes.js",
    {
        "../../graphql_node/graphql-node.js": GraphQLNode
    }
);

describe("validateNodes", () => {
    it("should throw nodes required", () => {
        try {
            validateNodes();

            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("nodes required");
        }
    });

    it("should throw expected nodes to be an array", () => {
        try {
            validateNodes({});

            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("expected nodes to be of type array");
        }
    });

    it("should throw at least 1 node is required", () => {
        try {
            validateNodes([]);

            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("at least 1 node is required");
        }
    });

    it("should throw GraphQLNode already registered", () => {
        try {
            const RUNTIME = {
                REGISTERED_NAMES: {
                    User: 1
                }
            };

            validateNodes([new GraphQLNode({ name: "User" })], RUNTIME);

            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain(
                    "GraphQLNode with name: 'User' already registered."
                );
        }
    });

    it("should validate a node and add to registered names", () => {
        const RUNTIME = {
            REGISTERED_NAMES: {}
        };

        validateNodes([new GraphQLNode({ name: "User" })], RUNTIME);

        expect(RUNTIME.REGISTERED_NAMES).to.have.property("User");
    });
});
