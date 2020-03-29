const { expect } = require("chai");
const proxyquire = require("proxyquire");

describe("serveAppliance", () => {
    it("should return a function", () => {
        function createAction() {}
        function abort() {}
        function introspectionCall() {}
        function handleIntrospection() {}
        function createBroker() {}

        const serveAppliance = proxyquire(
            "../../../../src/api/appliances/methods/serve-appliance.js",
            {
                "../../../util/index.js": {
                    createAction,
                    abort,
                    introspectionCall,
                    handleIntrospection,
                    createBroker
                }
            }
        );

        expect(serveAppliance()).to.be.a("function");
    });

    it("should serve a enum", async () => {
        let testFunc;

        function createAction() {}
        function abort() {}
        function introspectionCall(RUNTIME) {
            return (resolve, reject) => {
                RUNTIME.initialized = true;

                resolve();
            };
        }
        function handleIntrospection() {}
        function createBroker() {
            return {
                options: {
                    nodeID: "Name:gateway:uuid"
                },
                createService: (service) =>
                    (testFunc = service.actions.resolver),
                start: () => true
            };
        }

        const serveAppliance = proxyquire(
            "../../../../src/api/appliances/methods/serve-appliance.js",
            {
                "../../../util/index.js": {
                    createAction,
                    abort,
                    introspectionCall,
                    handleIntrospection,
                    createBroker
                }
            }
        );

        const _enum = {
            name: "Status",
            typeDefs: `
            enum Status {
                ONLINE
                OFFLINE
            }`,
            resolver: {
                test: true
            }
        };

        const metadata = { singular: "enum" };

        const _serveAppliance = serveAppliance(metadata).bind(_enum);

        const brokerOptions = { gateway: "gateway" };

        const result = await _serveAppliance(brokerOptions);

        expect(result).to.be.a("object");

        {
            const { broker } = result;

            expect(broker).to.be.a("object");

            const {
                options: { nodeID }
            } = broker;

            expect(nodeID).to.be.a("string").to.contain("Name:gateway:uuid");
        }

        {
            const { introspection } = result;

            expect(introspection).to.be.a("object");

            const { name, typeDefs, resolver } = introspection;

            expect(name).to.be.a("string").to.contain("Status");

            expect(typeDefs).to.be.a("string").to.contain(`enum Status`);

            expect(resolver)
                .to.be.a("string")
                .to.contain("Name:gateway:uuid.resolver"); // microservices call
        }

        expect(result.initialized).to.equal(true);

        expect(testFunc).to.be.a("function");

        expect(testFunc()).to.eql({ test: true });
    });

    it("should serve a interface", async () => {
        let testFunc;

        function createAction({}) {
            return () => ({ test: true });
        }

        function abort() {}
        function introspectionCall(RUNTIME) {
            return (resolve, reject) => {
                RUNTIME.initialized = true;

                resolve();
            };
        }
        function handleIntrospection() {}
        function createBroker() {
            return {
                options: {
                    nodeID: "Name:gateway:uuid"
                },
                createService: (service) =>
                    (testFunc = service.actions.resolver),
                start: () => true
            };
        }

        const serveAppliance = proxyquire(
            "../../../../src/api/appliances/methods/serve-appliance.js",
            {
                "../../../util/index.js": {
                    createAction,
                    abort,
                    introspectionCall,
                    handleIntrospection,
                    createBroker
                }
            }
        );

        const _interface = {
            name: "Status",
            typeDefs: `
            interface Status {
                health: String
                xp: Int
            }`,
            resolver: {
                __resolveType: () => test
            }
        };

        const metadata = { singular: "interface" };

        const _serveAppliance = serveAppliance(metadata).bind(_interface);

        const brokerOptions = { gateway: "gateway" };

        const result = await _serveAppliance(brokerOptions);

        expect(result).to.be.a("object");

        {
            const { broker } = result;

            expect(broker).to.be.a("object");

            const {
                options: { nodeID }
            } = broker;

            expect(nodeID).to.be.a("string").to.contain("Name:gateway:uuid");
        }

        {
            const { introspection } = result;

            expect(introspection).to.be.a("object");

            const { name, typeDefs, resolver } = introspection;

            expect(name).to.be.a("string").to.contain("Status");

            expect(typeDefs).to.be.a("string").to.contain(`interface Status`);

            expect(resolver)
                .to.be.a("string")
                .to.contain("Name:gateway:uuid.resolver"); // microservices call
        }

        expect(result.initialized).to.equal(true);

        expect(testFunc()).to.eql({ test: true });
    });

    it("should serve a type", async () => {
        let testFunc;

        function createAction({ method }) {
            return () => method();
        }

        function abort() {}
        function introspectionCall(RUNTIME) {
            return (resolve, reject) => {
                RUNTIME.initialized = true;

                resolve();
            };
        }
        function handleIntrospection() {}
        function createBroker() {
            return {
                options: {
                    nodeID: "Name:gateway:uuid"
                },
                createService: ({ actions: { feet } = {} }) =>
                    (testFunc = feet),
                start: () => true
            };
        }

        const serveAppliance = proxyquire(
            "../../../../src/api/appliances/methods/serve-appliance.js",
            {
                "../../../util/index.js": {
                    createAction,
                    abort,
                    introspectionCall,
                    handleIntrospection,
                    createBroker
                }
            }
        );

        const type = {
            name: "User",
            typeDefs: `
            type User {
                feet: Int
            }`,
            resolvers: {
                feet: () => 2
            }
        };

        const metadata = { singular: "type" };

        const _serveAppliance = serveAppliance(metadata).bind(type);

        const brokerOptions = { gateway: "gateway" };

        const result = await _serveAppliance(brokerOptions);

        expect(result).to.be.a("object");

        {
            const { broker } = result;

            expect(broker).to.be.a("object");

            const {
                options: { nodeID }
            } = broker;

            expect(nodeID).to.be.a("string").to.contain("Name:gateway:uuid");
        }

        {
            const { introspection } = result;

            expect(introspection).to.be.a("object");

            const { name, typeDefs, resolvers } = introspection;

            expect(name).to.be.a("string").to.contain("User");

            expect(typeDefs).to.be.a("string").to.contain(`type User`);

            expect(resolvers).to.be.a("array");

            const [feet] = resolvers;

            expect(feet).to.be.a("string").to.contain("feet");
        }

        expect(result.initialized).to.equal(true);

        expect(testFunc()).to.eql(2);
    });
});
