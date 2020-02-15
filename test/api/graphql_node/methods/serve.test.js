const { expect } = require("chai");
const proxyquire = require("proxyquire");

function applianceServe() {
    return true;
}

const _enum = {
    serve: applianceServe
};

const _union = {
    serve: applianceServe
};

const _interface = {
    serve: applianceServe
};

const _node = {
    serve: applianceServe
};

function handleIntrospection(RUNTIME) {
    RUNTIME.initialized = true;

    return () => true;
}

function introspectionCall() {
    return (resolve) => {
        resolve();
    };
}

function createAction() {
    return () => true;
}

const services = [];
let actions;

function createBroker() {
    return {
        createService: ({ name, actions: _actions }) => {
            services.push(name);

            actions = { ...actions, ..._actions };
        },
        start: () => true,
        waitForServices: () => true
    };
}

const brokerOptions = {
    gateway: "gateway",
    nodeId: "nodeId"
};

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
    resolvers: {
        Query: {
            user: () => true
        }
    },
    enums: [_enum],
    interfaces: [_interface],
    unions: [_union],
    nodeSs: [_node]
};

const serve = proxyquire("../../../../src/api/graphql_node/methods/serve.js", {
    "../../../util/index.js": {
        handleIntrospection,
        introspectionCall,
        createAction,
        createBroker
    }
});

describe("serve", () => {
    it("should preform start and return RUNTIME", async () => {
        const RUNTIME = await serve.bind(node)(brokerOptions);

        expect(RUNTIME).to.be.a("object");

        const {
            broker,
            gatewayManagers,
            initialized,
            introspection,
            brokerOptions: _brokerOptions
        } = RUNTIME;

        expect(broker).to.be.a("object");

        expect(gatewayManagers).to.be.a("object");

        expect(initialized).to.equal(true);

        expect(introspection).to.be.a("object");

        const { name, typeDefs, resolvers, hash } = introspection;

        expect(name)
            .to.be.a("string")
            .to.equal(node.name);

        expect(typeDefs)
            .to.be.a("string")
            .to.equal(node.typeDefs);

        expect(hash)
            .to.be.a("string")
            .to.equal(node.typeDefs);

        expect(resolvers)
            .to.be.a("object")
            .to.have.property("Query")
            .to.be.a("array")
            .to.include("user");

        expect(_brokerOptions)
            .to.be.a("object")
            .to.have.property("nodeId")
            .to.equal(brokerOptions.nodeId);

        expect(_brokerOptions)
            .to.be.a("object")
            .to.have.property("gateway")
            .to.equal(brokerOptions.gateway);

        expect(services).to.be.a("array");

        if (
            !services.includes(node.name) ||
            !services.includes(brokerOptions.node)
        ) {
            throw new Error("services not created");
        }

        expect(actions).to.be.a("object");

        const {
            "gateway:introspection": gatewayIntrospection,
            abort,
            user
        } = actions;

        expect(gatewayIntrospection).to.be.a("function");

        expect(abort).to.be.a("function");

        expect(user).to.be.a("function");
    });
});
