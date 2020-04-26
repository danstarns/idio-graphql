const { expect } = require("chai");
const proxyquire = require("proxyquire");
const { v4: uuidv4 } = require("uuid");

const uuid = uuidv4();

let nodeID;

function createConfig(config) {
    if (!config) {
        throw new Error("!config");
    }

    if (!(typeof config === "object")) {
        throw new Error("typeOf config !== object");
    }

    return config;
}

function start({ config, broker }) {
    if (!config) {
        throw new Error("!config");
    }

    if (!(typeof config === "object")) {
        throw new Error("typeOf config !== object");
    }

    if (!broker) {
        throw new Error("!broker");
    }

    if (!(typeof broker === "object")) {
        throw new Error("typeOf broker !== object");
    }

    if (!broker.nodeID === nodeID) {
        throw new Error("nodeID not equal");
    }

    return () => {};
}

function createBroker({ name }, { brokerOptions: { gateway } }) {
    nodeID = `${name}:${gateway}:${uuid}`;

    return {
        options: {
            nodeID
        }
    };
}

const GraphQLGateway = proxyquire(
    "../../../src/api/graphql_gateway/graphql-gateway.js",
    {
        "./methods/index.js": { createConfig, start },
        "../../util/index.js": { createBroker }
    }
);

describe("GraphQLGateway", () => {
    it("should throw brokerOptions.nodeId required", () => {
        try {
            // eslint-disable-next-line no-new
            new GraphQLGateway({});

            throw new Error();
        } catch (error) {
            expect(error.message).to.equal("brokerOptions.nodeID required");
        }
    });

    it("should create and return a instance of graphql-gateway", () => {
        const gateway = new GraphQLGateway({}, { nodeID: "test" });

        expect(gateway)
            .to.have.property("broker")
            .to.be.a("object")
            .to.have.property("options")
            .to.be.a("object")
            .to.have.property("nodeID")
            .to.equal(nodeID);

        expect(gateway).to.have.property("start").to.be.a("function");

        expect(gateway)
            .to.have.property("broker")
            .to.be.a("object")
            .to.have.property("options")
            .to.be.a("object")
            .to.have.property("nodeID")
            .to.contain("test");
    });
});
