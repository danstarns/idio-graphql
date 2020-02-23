const { expect } = require("chai");
const { makeExecutableSchema } = require("graphql-tools");
const gql = require("graphql-tag");
const proxyquire = require("proxyquire");
const execute = require("../../src/util/execute.js");
const IdioError = require("../../src/api/idio-error.js");

describe("execute", () => {
    it("should return 2 methods", () => {
        expect(execute)
            .to.be.a("object")
            .to.have.property("withSchema")
            .to.be.a("function");

        expect(execute)
            .to.be.a("object")
            .to.have.property("withBroker")
            .to.be.a("function");
    });

    describe("withSchema", () => {
        const typeDefs = gql`
            type User {
                name: String
                age: Int
            }

            type Query {
                user: User
            }
        `;

        const resolvers = {
            Query: {
                user: () => ({ name: "Dan", age: 20 })
            }
        };

        const schema = makeExecutableSchema({ typeDefs, resolvers });

        it("should throw document required", async () => {
            const _execute = execute.withSchema(schema);

            const { errors } = await _execute();

            const [error] = errors;

            expect(error.message)
                .to.be.a("string")
                .to.contain("document required");
        });

        it("should throw must provide document string or AST", async () => {
            const _execute = execute.withSchema(schema);

            const { errors } = await _execute(1);

            const [error] = errors;

            expect(error.message)
                .to.be.a("string")
                .to.contain("document must be a string or AST.");
        });

        it("should throw invalid document required", async () => {
            const _execute = execute.withSchema(schema);

            const { errors } = await _execute({ not: "valid" });

            const [error] = errors;

            expect(error.message)
                .to.be.a("string")
                .to.contain("invalid document provided.");
        });

        it("should throw subscriptions not supported, with a document string", async () => {
            const _execute = execute.withSchema(schema);

            const { errors } = await _execute(`
                    subscription {
                        userUpdate {
                            name
                            age
                        }
                    }
                `);

            const [error] = errors;

            expect(error.message)
                .to.be.a("string")
                .to.contain("subscriptions not supported.");
        });

        it("should throw subscriptions not supported, with a document AST", async () => {
            const _execute = execute.withSchema(schema);

            const { errors } = await _execute(gql`
                subscription {
                    userUpdate {
                        name
                        age
                    }
                }
            `);

            const [error] = errors;

            expect(error.message)
                .to.be.a("string")
                .to.contain("subscriptions not supported.");
        });

        it("should query against the schema", async () => {
            const _execute = execute.withSchema(schema);

            const result = await _execute(gql`
                {
                    user {
                        name
                        age
                    }
                }
            `);

            expect(result)
                .to.be.a("object")
                .to.have.property("data")
                .to.be.a("object")
                .to.have.property("user")
                .to.be.a("object");

            const {
                data: {
                    user: { name, age }
                }
            } = result;

            expect(name)
                .to.be.a("string")
                .to.equal("Dan");

            expect(age)
                .to.be.a("number")
                .to.equal(20);
        });

        it("should query against the schema throw hardcoded execution result", async () => {
            const stubbedExecute = proxyquire("../../src/util/execute.js", {
                graphql: {
                    graphql: () => {
                        throw new Error("testing");
                    },
                    language: {
                        parser: {
                            parse: () => true
                        },
                        printer: {
                            print: () => true
                        }
                    }
                }
            });

            const _execute = stubbedExecute.withSchema(schema);

            const result = await _execute(gql`
                {
                    user {
                        name
                        age
                    }
                }
            `);

            expect(result)
                .to.be.a("object")
                .to.have.property("errors")
                .to.be.a("array");

            const [error] = result.errors;

            expect(error).to.be.a.instanceOf(IdioError);
        });
    });

    describe("withBroker", () => {
        const RUNTIME = {
            broker: {
                call: () => true
            },
            gatewayManagers: {}
        };

        it("should throw document required", async () => {
            const _execute = execute.withBroker(RUNTIME);

            const { errors } = await _execute();

            const [error] = errors;

            expect(error.message)
                .to.be.a("string")
                .to.contain("document required");
        });

        it("should throw must provide document string or AST", async () => {
            const _execute = execute.withBroker(RUNTIME);

            const { errors } = await _execute(1);

            const [error] = errors;

            expect(error.message)
                .to.be.a("string")
                .to.contain("document must be a string or AST.");
        });

        it("should throw invalid document required", async () => {
            const _execute = execute.withBroker(RUNTIME);

            const { errors } = await _execute({ not: "valid" });

            const [error] = errors;

            expect(error.message)
                .to.be.a("string")
                .to.contain("invalid document provided.");
        });

        it("should throw subscriptions not supported, with a document string", async () => {
            const _execute = execute.withBroker(RUNTIME);

            const { errors } = await _execute(`
                subscription {
                    userUpdate {
                        name
                        age
                    }
                }
            `);

            const [error] = errors;

            expect(error.message)
                .to.be.a("string")
                .to.contain("subscriptions not supported.");
        });

        it("should throw subscriptions not supported, with a document AST", async () => {
            const _execute = execute.withBroker(RUNTIME);

            const { errors } = await _execute(gql`
                subscription {
                    userUpdate {
                        name
                        age
                    }
                }
            `);

            const [error] = errors;

            expect(error.message)
                .to.be.a("string")
                .to.contain("subscriptions not supported.");
        });

        it("should throw interservice communication @gateway directive only supported once per document.", async () => {
            const _execute = execute.withBroker(RUNTIME);

            const { errors } = await _execute(gql`
                query
                    @gateway(name: "gateway_accounts")
                    @gateway(name: "gateway_content") {
                    userUpdate {
                        name
                        age
                    }
                }
            `);

            const [error] = errors;

            expect(error.message)
                .to.be.a("string")
                .to.contain(
                    "interservice communication @gateway directive only supported once per document."
                );
        });

        it("should throw @gateway directive requires 1 argument, called name, of type string.", async () => {
            const _execute = execute.withBroker(RUNTIME);

            const { errors } = await _execute(gql`
                query @gateway {
                    userUpdate {
                        name
                        age
                    }
                }
            `);

            const [error] = errors;

            expect(error.message)
                .to.be.a("string")
                .to.contain(
                    "@gateway directive requires 1 argument, called name, of type string."
                );
        });

        it("should throw @gateway directive requires 1 argument, called name, of type string.", async () => {
            const _execute = execute.withBroker(RUNTIME);

            const { errors } = await _execute(gql`
                query @gateway(invalid: "arg") {
                    userUpdate {
                        name
                        age
                    }
                }
            `);

            const [error] = errors;

            expect(error.message)
                .to.be.a("string")
                .to.contain(
                    "@gateway directive requires 1 argument, called name, of type string."
                );
        });

        it("should throw @gateway directive requires 1 argument, called name, of type string.", async () => {
            const _execute = execute.withBroker(RUNTIME);

            const { errors } = await _execute(gql`
                query @gateway(name: 1) {
                    userUpdate {
                        name
                        age
                    }
                }
            `);

            const [error] = errors;

            expect(error.message)
                .to.be.a("string")
                .to.contain(
                    "@gateway directive requires 1 argument, called name, of type string."
                );
        });

        it("should throw cannot reach gateway if the gateway request for selected gateway returns no services", async () => {
            const broker = {
                call: () => []
            };

            const ServicesManagerStub = function ServicesManager(
                service,
                { hash }
            ) {
                const [serviceName, gateway] = service.split(":");

                this.gateway = gateway;
                this.serviceName = serviceName;
                this.hash = hash;
                this.activeServices = [service];
                this.lastOutput;
            };

            const stubbedExecute = proxyquire("../../src/util/execute.js", {
                "./services-manager.js": ServicesManagerStub
            });

            const _execute = stubbedExecute.withBroker({
                broker,
                gatewayManagers: {}
            });

            const { errors } = await _execute(gql`
                query @gateway(name: "gateway") {
                    userUpdate {
                        name
                        age
                    }
                }
            `);

            const [error] = errors;

            expect(error.message)
                .to.be.a("string")
                .to.contain("cannot reach gateway: 'gateway'");
        });

        it("should throw cannot reach gateway if the default manager dose not return any services", async () => {
            const broker = {
                call: () => [],
                options: { gateway: "gateway" }
            };

            const ServicesManagerStub = function ServicesManager(
                service,
                { hash }
            ) {
                const [serviceName, gateway] = service.split(":");

                this.gateway = gateway;
                this.serviceName = serviceName;
                this.hash = hash;
                this.activeServices = [service];
                this.lastOutput;
            };

            const stubbedExecute = proxyquire("../../src/util/execute.js", {
                "./services-manager.js": ServicesManagerStub
            });

            const _execute = stubbedExecute.withBroker({
                broker,
                gatewayManagers: { gateway: { getNextService: () => false } }
            });

            const { errors } = await _execute(gql`
                query {
                    userUpdate {
                        name
                        age
                    }
                }
            `);

            const [error] = errors;

            expect(error.message)
                .to.be.a("string")
                .to.contain("cannot reach gateway: 'gateway'");
        });

        it("should throw cannot reach gateway if the existing manager dose not return any services", async () => {
            const broker = {
                call: () => []
            };

            const ServicesManagerStub = function ServicesManager(
                service,
                { hash }
            ) {
                const [serviceName, gateway] = service.split(":");

                this.gateway = gateway;
                this.serviceName = serviceName;
                this.hash = hash;
                this.activeServices = [service];
                this.lastOutput;
            };

            const stubbedExecute = proxyquire("../../src/util/execute.js", {
                "./services-manager.js": ServicesManagerStub
            });

            const _execute = stubbedExecute.withBroker({
                broker,
                gatewayManagers: { gateway: { getNextService: () => false } }
            });

            const { errors } = await _execute(gql`
                query @gateway(name: "gateway") {
                    userUpdate {
                        name
                        age
                    }
                }
            `);

            const [error] = errors;

            expect(error.message)
                .to.be.a("string")
                .to.contain("cannot reach gateway: 'gateway'");
        });

        it("should call the default gateway and remove the directive from the document", async () => {
            const broker = {
                options: {
                    gateway: "gateway"
                },
                call: () => {
                    return {
                        data: { tested: true },
                        errors: null
                    };
                }
            };

            const ServicesManagerStub = function ServicesManager(
                service,
                { hash }
            ) {
                const [serviceName, gateway] = service.split(":");

                this.gateway = gateway;
                this.serviceName = serviceName;
                this.hash = hash;
                this.activeServices = [service];
                this.lastOutput;
            };

            const stubbedExecute = proxyquire("../../src/util/execute.js", {
                "./services-manager.js": ServicesManagerStub
            });

            const _execute = stubbedExecute.withBroker({
                broker,
                gatewayManagers: { gateway: { getNextService: () => true } }
            });

            const { data, errors } = await _execute(gql`
                query {
                    userUpdate {
                        name
                        age
                    }
                }
            `);

            expect(data)
                .to.be.a("object")
                .to.have.property("tested")
                .to.equal(true);

            expect(errors).to.be.null;
        });

        it("should create a service broker call the selected gateway and remove the directive from document", async () => {
            const ServicesManagerStub = function ServicesManager(
                service,
                { hash }
            ) {
                const [serviceName, gateway] = service.split(":");

                this.gateway = gateway;
                this.serviceName = serviceName;
                this.hash = hash;
                this.activeServices = [service];
                this.lastOutput;

                this.getNextService = () => service;
            };

            const broker = {
                options: {
                    gateway: "gateway"
                },
                call: async (str, { document }) => {
                    if (str.includes("execute")) {
                        if (document.includes("@gateway")) {
                            throw new Error(
                                "gateway should not be in the document, execute should extract it"
                            );
                        }

                        return {
                            data: { tested: true },
                            errors: null
                        };
                    }
                    return [
                        { id: "gateway:gateway:uuid" },
                        { id: "gateway:gateway:uuis23" }
                    ];
                }
            };

            const stubbedExecute = proxyquire("../../src/util/execute.js", {
                "./services-manager.js": ServicesManagerStub
            });

            const _execute = stubbedExecute.withBroker({
                broker,
                gatewayManagers: {}
            });

            const { data, errors } = await _execute(gql`
                query @gateway(name: "gateway") {
                    userUpdate {
                        name
                        age
                    }
                }
            `);

            expect(data)
                .to.be.a("object")
                .to.have.property("tested")
                .to.equal(true);

            expect(errors).to.be.null;
        });

        it("should call the selected gateway and remove the directive from the document and preserve any other directives", async () => {
            const broker = {
                options: {
                    gateway: "gateway"
                },
                call: (str, { document }) => {
                    if (document.includes("@gateway")) {
                        throw new Error(
                            "gateway should not be in the document, execute should extract it"
                        );
                    }

                    if (!document.includes("@test")) {
                        throw new Error(
                            "execute should preserve any other directives"
                        );
                    }

                    return {
                        data: { tested: true },
                        errors: null
                    };
                }
            };

            const ServicesManagerStub = function ServicesManager(
                service,
                { hash }
            ) {
                const [serviceName, gateway] = service.split(":");

                this.gateway = gateway;
                this.serviceName = serviceName;
                this.hash = hash;
                this.activeServices = [service];
                this.lastOutput;
            };

            const stubbedExecute = proxyquire("../../src/util/execute.js", {
                "./services-manager.js": ServicesManagerStub
            });

            const _execute = stubbedExecute.withBroker({
                broker,
                gatewayManagers: { gateway: { getNextService: () => true } }
            });

            const { data, errors } = await _execute(gql`
                query @gateway(name: "gateway") {
                    userUpdate {
                        name
                        age
                    }
                }

                query @test {
                    userUpdate {
                        name
                        age
                    }
                }

                query {
                    userUpdate {
                        name
                        age
                    }
                }
            `);

            expect(data)
                .to.be.a("object")
                .to.have.property("tested")
                .to.equal(true);

            expect(errors).to.be.null;
        });
    });
});
