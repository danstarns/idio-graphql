const { expect } = require("chai");

const proxyquire = require("proxyquire");

function ServicesManager(service) {
    const [serviceName] = service.split(":");

    this.serviceName = serviceName;
    this.activeServices = [service];

    this.push = (_service) => {
        this.activeServices.push(_service);
    };
}

const handleIntrospection = proxyquire(
    "../../src/util/handle-introspection.js",
    {
        "./services-manager.js": ServicesManager
    }
);

describe("handleIntrospection", () => {
    it("should create a gateway manager for the incoming service name and return introspection but not set initialized", async () => {
        const RUNTIME = {
            gatewayManagers: {},
            broker: {},
            brokerOptions: {
                gateway: "gateway"
            },
            initialized: false,
            introspection: {
                test: true
            }
        };

        const action = handleIntrospection(RUNTIME);

        const introspection = await action({
            params: {
                gateway: "another_gateway:gateway:uuid",
                hash: "uuid"
            }
        });

        expect(RUNTIME.gatewayManagers)
            .to.have.property("another_gateway")
            .to.be.a.instanceOf(ServicesManager);

        expect(introspection)
            .to.be.a("object")
            .to.have.property("test")
            .to.equal(true);

        expect(RUNTIME.initialized).to.equal(false);
    });

    it("should append the service to the existing gateway manager and return introspection but not set initialized", async () => {
        const RUNTIME = {
            gatewayManagers: {
                another_gateway: new ServicesManager(
                    "another_gateway:another_gateway:uuid"
                )
            },
            broker: {},
            brokerOptions: {
                gateway: "gateway"
            },
            initialized: false,
            introspection: {
                test: true
            }
        };

        const action = handleIntrospection(RUNTIME);

        const introspection = await action({
            params: {
                gateway: "another_gateway:gateway:uuid",
                hash: "uuid"
            }
        });

        expect(RUNTIME.gatewayManagers)
            .to.have.property("another_gateway")
            .to.be.a.instanceOf(ServicesManager);

        expect(RUNTIME.gatewayManagers.another_gateway.activeServices)
            .to.be.a("array")
            .lengthOf(2);

        expect(introspection)
            .to.be.a("object")
            .to.have.property("test")
            .to.equal(true);

        expect(RUNTIME.initialized).to.equal(false);
    });

    it("should create a service manager and return introspection set initialized to true", async () => {
        const RUNTIME = {
            gatewayManagers: {},
            broker: {},
            brokerOptions: {
                gateway: "gateway"
            },
            initialized: false,
            introspection: {
                test: true
            }
        };

        const action = handleIntrospection(RUNTIME);

        const introspection = await action({
            params: {
                gateway: "gateway:gateway:uuid",
                hash: "uuid"
            }
        });

        expect(RUNTIME.gatewayManagers)
            .to.have.property("gateway")
            .to.be.a.instanceOf(ServicesManager);

        expect(RUNTIME.gatewayManagers.gateway.activeServices)
            .to.be.a("array")
            .lengthOf(1);

        expect(introspection)
            .to.be.a("object")
            .to.have.property("test")
            .to.equal(true);

        expect(RUNTIME.initialized).to.equal(true);
    });
});
