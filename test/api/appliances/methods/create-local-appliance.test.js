const { expect } = require("chai");
const proxyquire = require("proxyquire");

function IdioEnum({ name, typeDefs, resolver }) {
    this.name = name;
    this.typeDefs = typeDefs;
    this.resolver = resolver;
}

function IdioUnion({ name, typeDefs, resolver }) {
    this.name = name;
    this.typeDefs = typeDefs;
    this.resolver = resolver;
}

function IdioInterface({ name, typeDefs, resolver }) {
    this.name = name;
    this.typeDefs = typeDefs;
    this.resolver = resolver;
}

function GraphQLType({ name, typeDefs, resolvers }) {
    this.name = name;
    this.typeDefs = typeDefs;
    this.resolvers = resolvers;
}

const createLocalAppliance = proxyquire(
    "../../../../src/api/appliances/methods/create-local-appliance.js",
    {
        "../idio-enum.js": IdioEnum,
        "../idio-union.js": IdioUnion,
        "../idio-interface.js": IdioInterface,
        "../graphql-type.js": GraphQLType
    }
);

describe("createLocalAppliance", () => {
    it("should return a function", () => {
        expect(
            createLocalAppliance({
                type: "unions",
                broker: {},
                serviceManagers: {}
            })
        ).to.be.a("function");
    });

    it("should throw invalid type", () => {
        try {
            createLocalAppliance({
                type: "abc",
                broker: {},
                serviceManagers: {}
            });
            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("invalid type");
        }
    });

    it("should create a local enum", () => {
        const result = createLocalAppliance({
            type: "enums",
            broker: {},
            serviceManagers: { enum: {} }
        })({
            name: "Test",
            typeDefs: `
            enum Test {
                A
                B
            }
            `,
            resolver: () => ({ test: true })
        });

        expect(result).to.be.a.instanceOf(IdioEnum);

        expect(result.resolver()).to.eql({ test: true });

        expect(result.typeDefs)
            .to.a("string")
            .to.contain("enum Test");
    });

    it("should create a local union", () => {
        const result = createLocalAppliance({
            type: "unions",
            broker: {},
            serviceManagers: { union: {} }
        })({
            name: "Test",
            typeDefs: `
            union Test =  A | B
            `,
            resolver: { __resolveType: () => ({ test: true }) }
        });

        expect(result).to.be.a.instanceOf(IdioUnion);

        expect(result.resolver.__resolveType).to.a("function");

        expect(result.typeDefs)
            .to.a("string")
            .to.contain("union Test =  A | B");
    });

    it("should create a local interface", () => {
        const result = createLocalAppliance({
            type: "interfaces",
            broker: {},
            serviceManagers: { interface: {} }
        })({
            name: "ABC",
            typeDefs: `
            interface ABC {
                a: String
                b: String
                c: String
            }
            `,
            resolver: { __resolveType: () => ({ test: true }) }
        });

        expect(result).to.be.a.instanceOf(IdioInterface);

        expect(result.resolver.__resolveType).to.a("function");

        expect(result.typeDefs)
            .to.a("string")
            .to.contain("interface ABC");
    });

    it("should create a local interface & throw no service online", async () => {
        const result = createLocalAppliance({
            type: "interfaces",
            broker: {},
            serviceManagers: {
                interface: { ABC: { getNextService: () => false } }
            }
        })({
            name: "ABC",
            typeDefs: `
            interface ABC {
                a: String
                b: String
                c: String
            }
            `,
            resolver: { __resolveType: () => ({ test: true }) }
        });

        expect(result).to.be.a.instanceOf(IdioInterface);

        try {
            await result.resolver.__resolveType();
        } catch ({ message }) {
            expect(message)
                .to.a("string")
                .to.contain("No service with name: 'ABC' online.");
        }
    });

    it("should create a local interface & return broker call", async () => {
        const result = createLocalAppliance({
            type: "interfaces",
            broker: { call: () => ({ test: true }) },
            serviceManagers: {
                interface: { ABC: { getNextService: () => true } }
            }
        })({
            name: "ABC",
            typeDefs: `
            interface ABC {
                a: String
                b: String
                c: String
            }
            `,
            resolver: { __resolveType: () => ({ test: true }) }
        });

        expect(result).to.be.a.instanceOf(IdioInterface);

        expect(await result.resolver.__resolveType())
            .to.be.a("object")
            .to.have.property("test");
    });

    it("should create a local union & return broker call", async () => {
        const result = createLocalAppliance({
            type: "unions",
            broker: { call: () => ({ test: true }) },
            serviceManagers: {
                union: { ABC: { getNextService: () => true } }
            }
        })({
            name: "ABC",
            typeDefs: `
            union Test =  A | B
            `,
            resolver: { __resolveType: () => ({ test: true }) }
        });

        expect(result).to.be.a.instanceOf(IdioUnion);

        expect(await result.resolver.__resolveType())
            .to.be.a("object")
            .to.have.property("test");
    });

    it("should create a local type", () => {
        const result = createLocalAppliance({
            type: "types",
            broker: { call: () => ({ test: true }) },
            serviceManagers: {
                type: { User: { getNextService: () => true } }
            }
        })({
            name: "User",
            typeDefs: `
                type User {
                    name: String
                }
            `,
            resolvers: ["name"]
        });

        expect(result).to.be.a.instanceOf(GraphQLType);
    });

    it("should create a local type and catch an error when not service is found", async () => {
        try {
            const result = createLocalAppliance({
                type: "types",
                broker: {
                    call: () => true
                },
                serviceManagers: {
                    type: { User: { getNextService: () => false } }
                }
            })({
                name: "User",
                typeDefs: `
                    type User {
                        name: String
                    }
                `,
                resolvers: ["name"]
            });

            expect(result).to.be.a.instanceOf(GraphQLType);

            await result.resolvers.name();

            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("No service with name: 'User' online");
        }
    });

    it("should create a local type and catch an error when it fails", async () => {
        try {
            const result = createLocalAppliance({
                type: "types",
                broker: {
                    call: () => {
                        throw new Error("test");
                    }
                },
                serviceManagers: {
                    type: { User: { getNextService: () => true } }
                }
            })({
                name: "User",
                typeDefs: `
                    type User {
                        name: String
                    }
                `,
                resolvers: ["name"]
            });

            expect(result).to.be.a.instanceOf(GraphQLType);

            await result.resolvers.name();

            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("failed, test");
        }
    });
});
