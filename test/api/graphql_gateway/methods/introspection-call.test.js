const { expect } = require("chai");

function ServicesManager(service, { broker, hash } = {}) {
    if (!service) {
        throw new Error("service required");
    }

    if (!(typeof service === "string")) {
        throw new Error("service should be string");
    }

    if (!service.includes(":gateway:")) {
        throw new Error("service name dose not contain gateway");
    }

    if (!broker) {
        throw new Error("broker missing");
    }

    if (!hash) {
        throw new Error("hash required");
    }

    if (!(typeof hash === "string")) {
        throw new Error("hash should be string");
    }

    if (hash !== "test") {
        throw new Error("incorrect hash");
    }

    this.push = () => true;

    this.tested = true;
}

const proxyquire = require("proxyquire");

const introspectionCall = proxyquire(
    "../../../../src/api/graphql_gateway/methods/introspection-call.js",
    {
        "../../../util/index.js": { ServicesManager }
    }
);

describe("introspectionCall", () => {
    it("should return a function", () => {
        expect(introspectionCall({})).to.be.a("function");
    });

    it("should preform introspection call for a node", async () => {
        let thrown = 0;

        const RUNTIME = {
            broker: {
                options: {
                    nodeID: "gateway:gateway:uuid"
                },
                call: (INTROSPECTION_CALL, body) => {
                    if (!INTROSPECTION_CALL) {
                        throw new Error("INTROSPECTION_CALL missing");
                    }

                    if (!(typeof INTROSPECTION_CALL === "string")) {
                        throw new Error("INTROSPECTION_CALL must be a string");
                    }

                    if (
                        !INTROSPECTION_CALL.includes(
                            "User.gateway:introspection"
                        )
                    ) {
                        throw new Error("INTROSPECTION_CALL incorrect");
                    }

                    if (!body) {
                        throw new Error("body required");
                    }

                    if (!(typeof body === "object")) {
                        throw new Error("body must be object");
                    }

                    if (!body.gateway) {
                        throw new Error("body.gateway missing");
                    }

                    if (!body.hash) {
                        throw new Error("body.hash missing");
                    }

                    if (!thrown) {
                        thrown = true;
                        throw new Error("test");
                    } else {
                        return {
                            name: "User",
                            hash: "test"
                        };
                    }
                }
            },
            serviceManagers: {},
            waitingServices: {},
            registeredServices: {}
        };

        const _introspectionCall = introspectionCall(RUNTIME);

        await _introspectionCall("User:gateway:uuid", "node");

        await _introspectionCall("User:gateway:uuid", "node");

        expect(RUNTIME).to.be.a("object");

        const {
            broker,
            serviceManagers,
            waitingServices,
            registeredServices
        } = RUNTIME;

        expect(broker).to.be.a("object");

        {
            const {
                options: { nodeID },
                call
            } = broker;

            expect(nodeID)
                .to.be.a("string")
                .to.equal("gateway:gateway:uuid");

            expect(call).to.be.a("function");
        }

        expect(serviceManagers)
            .to.be.a("object")
            .to.have.property("node")
            .to.be.a("object")
            .to.have.property("User")
            .to.be.a.instanceOf(ServicesManager);

        expect(waitingServices)
            .to.be.a("object")
            .to.have.property("nodes")
            .to.be.a("array")
            .lengthOf(0);

        expect(registeredServices)
            .to.be.a("object")
            .to.have.property("nodes")
            .to.be.a("array");
    });

    it("should preform introspection call for a Interface", async () => {
        let thrown = 0;

        const RUNTIME = {
            serviceManagers: {
                interface: {}
            },
            waitingServices: {
                interfaces: ["Person"]
            },
            registeredServices: {},
            broker: {
                options: {
                    nodeID: "gateway:gateway:uuid"
                },
                call: (INTROSPECTION_CALL, body) => {
                    if (!INTROSPECTION_CALL) {
                        throw new Error("INTROSPECTION_CALL missing");
                    }

                    if (!(typeof INTROSPECTION_CALL === "string")) {
                        throw new Error("INTROSPECTION_CALL must be a string");
                    }

                    if (
                        !INTROSPECTION_CALL.includes(
                            "Person.gateway:introspection"
                        )
                    ) {
                        throw new Error("INTROSPECTION_CALL incorrect");
                    }

                    if (!body) {
                        throw new Error("body required");
                    }

                    if (!(typeof body === "object")) {
                        throw new Error("body must be object");
                    }

                    if (!body.gateway) {
                        throw new Error("body.gateway missing");
                    }

                    if (!body.hash) {
                        throw new Error("body.hash missing");
                    }

                    if (!thrown) {
                        thrown = true;
                        throw new Error("test");
                    } else {
                        return {
                            name: "Person",
                            hash: "test"
                        };
                    }
                }
            }
        };

        const _introspectionCall = introspectionCall(RUNTIME);

        await _introspectionCall("Person:gateway:uuid", "interface");

        await _introspectionCall("Person:gateway:uuid", "interface");

        expect(RUNTIME).to.be.a("object");

        const {
            broker,
            serviceManagers,
            waitingServices,
            registeredServices
        } = RUNTIME;

        expect(broker).to.be.a("object");

        {
            const {
                options: { nodeID },
                call
            } = broker;

            expect(nodeID)
                .to.be.a("string")
                .to.equal("gateway:gateway:uuid");

            expect(call).to.be.a("function");
        }

        expect(serviceManagers)
            .to.be.a("object")
            .to.have.property("interface")
            .to.be.a("object")
            .to.have.property("Person")
            .to.be.a("object")
            .to.have.property("push");

        expect(waitingServices)
            .to.be.a("object")
            .to.have.property("interfaces")
            .to.be.a("array")
            .lengthOf(0);

        expect(registeredServices)
            .to.be.a("object")
            .to.have.property("interfaces")
            .to.be.a("array");
    });

    it("should preform introspection call for a Interface and a node", async () => {
        let counter = 0;

        const RUNTIME = {
            serviceManagers: {
                interface: { Person: { push: () => true } }
            },
            waitingServices: {
                nodes: ["User"]
            },
            registeredServices: { interfaces: [], nodes: [] },
            broker: {
                options: {
                    nodeID: "gateway:gateway:uuid"
                },
                call: (INTROSPECTION_CALL, body) => {
                    if (!INTROSPECTION_CALL) {
                        throw new Error("INTROSPECTION_CALL missing");
                    }

                    if (!(typeof INTROSPECTION_CALL === "string")) {
                        throw new Error("INTROSPECTION_CALL must be a string");
                    }

                    if (
                        !INTROSPECTION_CALL.includes(
                            "Person.gateway:introspection"
                        ) &&
                        !INTROSPECTION_CALL.includes(
                            "User.gateway:introspection"
                        )
                    ) {
                        throw new Error("INTROSPECTION_CALL incorrect");
                    }

                    if (!body) {
                        throw new Error("body required");
                    }

                    if (!(typeof body === "object")) {
                        throw new Error("body must be object");
                    }

                    if (!body.gateway) {
                        throw new Error("body.gateway missing");
                    }

                    if (!body.hash) {
                        throw new Error("body.hash missing");
                    }

                    if (counter === 0) {
                        counter += 1;

                        return {
                            name: "Person",
                            hash: "test"
                        };
                    }

                    return {
                        name: "User",
                        hash: "test"
                    };
                }
            }
        };

        const _introspectionCall = introspectionCall(RUNTIME);

        await _introspectionCall("Person:gateway:uuid", "interface");

        await _introspectionCall("User:gateway:uuid", "node");

        expect(RUNTIME).to.be.a("object");

        const {
            broker,
            serviceManagers,
            waitingServices,
            registeredServices
        } = RUNTIME;

        expect(broker).to.be.a("object");

        {
            const {
                options: { nodeID },
                call
            } = broker;

            expect(nodeID)
                .to.be.a("string")
                .to.equal("gateway:gateway:uuid");

            expect(call).to.be.a("function");
        }

        expect(serviceManagers)
            .to.be.a("object")
            .to.have.property("interface")
            .to.be.a("object")
            .to.have.property("Person")
            .to.be.a("object")
            .to.have.property("push");

        expect(waitingServices)
            .to.be.a("object")
            .to.have.property("nodes")
            .to.be.a("array")
            .lengthOf(0);

        expect(registeredServices)
            .to.be.a("object")
            .to.have.property("nodes")
            .to.be.a("array");
    });
});
