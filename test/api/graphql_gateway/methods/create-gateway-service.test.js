const { expect } = require("chai");
const proxyquire = require("proxyquire");

function execute(RUNTIME) {
    return (...args) => ({ tested: true, RUNTIME, args });
}

function introspectionCall(RUNTIME) {
    return (...args) => ({ RUNTIME, args });
}

function abort() {
    return true;
}

describe("createGatewayService", () => {
    it("should create gateway services", async () => {
        const testServices = [];

        const RUNTIME = {
            registeredServices: {
                unions: [{ tested: true }],
                nodes: [{ tested: true }]
            },
            broker: {
                options: {
                    nodeID: "gateway:gateway:uuid"
                },
                createService: (service) => testServices.push(service)
            },
            serviceManagers: {},
            locals: { scalars: [{ tested: true }] }
        };

        const createGatewayService = proxyquire(
            "../../../../src/api/graphql_gateway/methods/create-gateway-service.js",
            {
                "./execute.js": execute,
                "./introspection-call.js": introspectionCall,
                "../../../util/index.js": { abort }
            }
        );

        createGatewayService(RUNTIME);

        const [service] = testServices;

        expect(service)
            .to.be.a("object")
            .to.have.property("name")
            .to.equal(RUNTIME.broker.options.nodeID);

        expect(service)
            .to.be.a("object")
            .to.have.property("events")
            .to.be.a("object");

        expect(service)
            .to.be.a("object")
            .to.have.property("actions")
            .to.be.a("object");

        const [serviceName] = RUNTIME.broker.options.nodeID.split(":");

        const INTROSPECTION_EVENT = `${serviceName}:introspection.request`;

        const {
            [INTROSPECTION_EVENT]: introspection,
            compare
        } = service.events;

        expect(introspection).to.be.a("function");
        expect(compare).to.be.a("function");

        const { abort: _abort, execute: _execute } = service.actions;

        expect(_abort).to.be.a("function");
        expect(_execute).to.be.a("function");
    });

    it("should create gateway services and throw missing local in compare", async () => {
        const testServices = [];

        const RUNTIME = {
            registeredServices: {
                unions: [{ tested: true }],
                nodes: [{ tested: true }]
            },
            broker: {
                call: (abc, { message }) => {
                    if (
                        !message.includes(
                            `'gateway' trying to join the network with a different hash to an existing. Error: introspection contains a invalid local`
                        )
                    ) {
                        throw new Error("wrong error");
                    }
                },
                options: {
                    nodeID: "gateway:gateway:uuid"
                },
                createService: (service) => testServices.push(service)
            },
            serviceManagers: {},
            locals: { scalars: [{ name: "Scalar" }] }
        };

        const createGatewayService = proxyquire(
            "../../../../src/api/graphql_gateway/methods/create-gateway-service.js",
            {
                "./execute.js": execute,
                "./introspection-call.js": introspectionCall,
                "../../../util/index.js": { abort }
            }
        );

        createGatewayService(RUNTIME);

        const [service] = testServices;

        expect(service)
            .to.be.a("object")
            .to.have.property("name")
            .to.equal(RUNTIME.broker.options.nodeID);

        expect(service)
            .to.be.a("object")
            .to.have.property("events")
            .to.be.a("object");

        expect(service)
            .to.be.a("object")
            .to.have.property("actions")
            .to.be.a("object");

        const { compare } = service.events;

        await compare(
            { name: "gateway", locals: { scalars: ["Scalar2"] } },
            "gateway:gateway:uuid"
        );

        await compare({ name: "gateway", locals: {} }, "gateway:gateway:uuid");
        await compare(
            { name: "gateway", locals: { scalars: ["Scalar"] } },
            "gateway:gateway:uuid"
        );
    });

    it("should create gateway services and throw missing service in compare", async () => {
        const testServices = [];

        const RUNTIME = {
            registeredServices: {
                unions: [{ tested: true }],
                nodes: [{ tested: true }]
            },
            broker: {
                call: (abc, { message }) => {
                    if (
                        !message.includes(
                            `'gateway' trying to join the network with a different hash to an existing. Error: introspection contains a invalid service`
                        )
                    ) {
                        throw new Error("wrong error");
                    }
                },
                options: {
                    nodeID: "gateway:gateway:uuid"
                },
                createService: (service) => testServices.push(service)
            },
            serviceManagers: {},
            services: { scalars: ["Scalar"] }
        };

        const createGatewayService = proxyquire(
            "../../../../src/api/graphql_gateway/methods/create-gateway-service.js",
            {
                "./execute.js": execute,
                "./introspection-call.js": introspectionCall,
                "../../../util/index.js": { abort }
            }
        );

        createGatewayService(RUNTIME);

        const [service] = testServices;

        expect(service)
            .to.be.a("object")
            .to.have.property("name")
            .to.equal(RUNTIME.broker.options.nodeID);

        expect(service)
            .to.be.a("object")
            .to.have.property("events")
            .to.be.a("object");

        expect(service)
            .to.be.a("object")
            .to.have.property("actions")
            .to.be.a("object");

        const { compare } = service.events;

        await compare(
            { name: "gateway", services: { scalars: ["Scalar2"] } },
            "gateway:gateway:uuid"
        );
    });

    it("should create gateway services and call execute", async () => {
        const testServices = [];

        const RUNTIME = {
            registeredServices: {
                unions: [{ tested: true }],
                nodes: [{ tested: true }]
            },
            broker: {
                call: (abc, { message }) => true,
                options: {
                    nodeID: "gateway:gateway:uuid"
                },
                createService: (service) => testServices.push(service)
            },
            serviceManagers: {},
            services: { scalars: ["Scalar"] }
        };

        const createGatewayService = proxyquire(
            "../../../../src/api/graphql_gateway/methods/create-gateway-service.js",
            {
                "./execute.js": execute,
                "./introspection-call.js": introspectionCall,
                "../../../util/index.js": { abort }
            }
        );

        createGatewayService(RUNTIME);

        const [service] = testServices;

        const { compare } = service.events;

        await compare(
            { name: "gateway", services: { scalars: ["Scalar"] } },
            "gateway:gateway:uuid"
        );

        expect(service)
            .to.be.a("object")
            .to.have.property("name")
            .to.equal(RUNTIME.broker.options.nodeID);

        expect(service)
            .to.be.a("object")
            .to.have.property("events")
            .to.be.a("object");

        expect(service)
            .to.be.a("object")
            .to.have.property("actions")
            .to.be.a("object");

        const { execute: _execute } = service.actions;

        const result = await _execute({ args: true });

        expect(result)
            .to.be.a("object")
            .to.have.property("RUNTIME")
            .to.eql(RUNTIME);

        expect(result)
            .to.be.a("object")
            .to.have.property("tested")

            .to.eql(true);
        expect(result)
            .to.be.a("object")
            .to.have.property("args")
            .to.be.a("array")
            .lengthOf(1);

        const [arg] = result.args;

        expect(arg)
            .to.be.a("object")
            .to.have.property("args")
            .to.equal(true);
    });

    it("should create gateway services and call introspection", async () => {
        const testServices = [];

        const RUNTIME = {
            registeredServices: {
                unions: [{ tested: true }],
                nodes: [{ tested: true }]
            },
            broker: {
                call: (abc, { message }) => true,
                options: {
                    nodeID: "gateway:gateway:uuid"
                },
                createService: (service) => testServices.push(service)
            },
            serviceManagers: {},
            services: { scalars: ["Scalar"] }
        };

        const createGatewayService = proxyquire(
            "../../../../src/api/graphql_gateway/methods/create-gateway-service.js",
            {
                "./execute.js": execute,
                "./introspection-call.js": introspectionCall,
                "../../../util/index.js": { abort }
            }
        );

        createGatewayService(RUNTIME);

        const [service] = testServices;

        expect(service)
            .to.be.a("object")
            .to.have.property("name")
            .to.equal(RUNTIME.broker.options.nodeID);

        expect(service)
            .to.be.a("object")
            .to.have.property("events")
            .to.be.a("object");

        expect(service)
            .to.be.a("object")
            .to.have.property("actions")
            .to.be.a("object");

        const [serviceName] = RUNTIME.broker.options.nodeID.split(":");

        const INTROSPECTION_EVENT = `${serviceName}:introspection.request`;

        const { [INTROSPECTION_EVENT]: introspection } = service.events;

        await introspection({});
    });
});
