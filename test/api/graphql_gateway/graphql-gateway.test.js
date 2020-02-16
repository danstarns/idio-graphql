const { expect } = require("chai");
const proxyquire = require("proxyquire");
const uuid = require("uuid/v4")();

let nodeId;

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

    if (!broker.nodeId === nodeId) {
        throw new Error("nodeId not equal");
    }

    return () => { };
}

function createBroker({ name }, { brokerOptions: { gateway } }) {
    nodeId = `${name}:${gateway}:${uuid}`;

    return {
        options: {
            nodeId
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
    it("should satisfy nyc with default paramter", () => {
        GraphQLGateway({});
    });

    it("should create and return a instance of graphql-gateway", () => {
        const gateway = new GraphQLGateway({}, {});

        expect(gateway)
            .to.have.property("broker")
            .to.be.a("object")
            .to.have.property("options")
            .to.be.a("object")
            .to.have.property("nodeId")
            .to.equal(nodeId);

        expect(gateway)
            .to.have.property("start")
            .to.be.a("function");
    });
});
