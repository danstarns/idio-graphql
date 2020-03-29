const { expect } = require("chai");
const proxyquire = require("proxyquire");

function validateRuntime({ broker, locals, services } = {}) {
    if (!broker) {
        throw new Error("broker not here");
    }

    if (!(typeof broker === "object")) {
        throw new Error("broker not a object");
    }

    if (!broker.options) {
        throw new Error("not broker.options");
    }

    if (!locals) {
        throw new Error("locals not here");
    }

    if (!(typeof locals === "object")) {
        throw new Error("locals not a object");
    }

    if (!services) {
        throw new Error("services not here");
    }

    if (!(typeof services === "object")) {
        throw new Error("services not a object");
    }
}

const testingServices = [];

const testingBroker = {
    start: () => true,
    createService: ({ name }) => testingServices.push(name),
    options: {
        nodeID: "testing"
    }
};

function combineNodes() {
    return {
        typeDefs: `testing`,
        resolvers: { test: true },
        schemaDirectives: { test: true },
        schema: { test: true },
        execute: () => true
    };
}

function GraphQLNode() {}

function createLocalNode() {
    return () => ({});
}

function serveLocals(RUNTIME) {
    validateRuntime(RUNTIME);
}

function checkForServices() {
    return (resolve) => {
        resolve();
    };
}

function createGatewayService(RUNTIME) {
    validateRuntime(RUNTIME);

    RUNTIME.broker.createService({ name: RUNTIME.broker.options.nodeID });
}

function createLocalAppliances(RUNTIME) {
    validateRuntime(RUNTIME);
}

function compareGateways(RUNTIME) {
    validateRuntime(RUNTIME);
}

const start = proxyquire(
    "../../../../src/api/graphql_gateway/methods/start.js",
    {
        "../../combine_nodes/combine-nodes.js": combineNodes,
        "../../graphql_node/graphql-node.js": GraphQLNode,
        "../../graphql_node/methods/index.js": { createLocalNode },
        "./serve-locals.js": serveLocals,
        "./check-for-services.js": checkForServices,
        "./create-gateway-service.js": createGatewayService,
        "./create-local-appliances.js": createLocalAppliances,
        "./compare-gateways.js": compareGateways
    }
);

describe("start", () => {
    it("should return a function", () => {
        expect(start()).to.be.a("function");
    });

    it("should start a gateway", async () => {
        const config = {
            locals: {},
            services: { nodes: [], enums: [], interfaces: [], unions: [] }
        };

        const _start = start({ config, broker: testingBroker });

        const runtime = await _start();

        expect(runtime).to.be.a("object");

        const {
            locals,
            services,
            registeredServices,
            waitingServices,
            serviceManagers,
            typeDefs,
            resolvers,
            schemaDirectives,
            broker,
            schema
        } = runtime;

        expect(broker).to.be.a("object");

        expect(serviceManagers).to.be.a("object");

        expect(waitingServices).to.be.a("object");

        expect(registeredServices).to.be.a("object");

        expect(services).to.be.a("object");

        expect(locals).to.be.a("object");

        expect(resolvers)
            .to.be.a("object")
            .to.have.property("test")
            .to.equal(true);

        expect(schemaDirectives)
            .to.be.a("object")
            .to.have.property("test")
            .to.equal(true);

        expect(schema)
            .to.be.a("object")
            .to.have.property("test")
            .to.equal(true);

        expect(typeDefs).to.be.a("string").to.contain("testing");
    });

    it("should start a gateway", async () => {
        const config = {
            locals: {},
            services: {}
        };

        const _start = start({ config, broker: testingBroker });

        const runtime = await _start();

        expect(runtime).to.be.a("object");

        const {
            locals,
            services,
            registeredServices,
            waitingServices,
            serviceManagers,
            typeDefs,
            resolvers,
            schemaDirectives,
            broker,
            schema,
            execute
        } = runtime;

        expect(broker).to.be.a("object");

        expect(serviceManagers).to.be.a("object");

        expect(waitingServices).to.be.a("object");

        expect(registeredServices).to.be.a("object");

        expect(services).to.be.a("object");

        expect(locals).to.be.a("object");

        expect(resolvers)
            .to.be.a("object")
            .to.have.property("test")
            .to.equal(true);

        expect(schemaDirectives)
            .to.be.a("object")
            .to.have.property("test")
            .to.equal(true);

        expect(schema)
            .to.be.a("object")
            .to.have.property("test")
            .to.equal(true);

        expect(typeDefs).to.be.a("string").to.contain("testing");

        expect(execute).to.be.a("function");
    });
});
