const { expect } = require("chai");
const createLocalNode = require("../../../../src/api/graphql_node/methods/create-local-node.js");
const GraphQLNode = require("../../../../src/api/graphql_node/graphql-node.js");
const iteratorToStream = require("../../../../src/util/iterator-to-stream.js");

describe("createLocalNode", () => {
    it("should create a instance of GraphQLNode with a Query resolver", async () => {
        const RUNTIME = {
            serviceManagers: {
                node: {
                    User: {
                        getNextService: () => "User:gateway:uuid"
                    }
                }
            },
            GraphQLNode,
            broker: {
                call: (service, { graphQLArgs }) => {
                    if (service !== "User:gateway:uuid:Query.user") {
                        throw new Error("serviceToCall invalid");
                    }

                    if (!(typeof graphQLArgs === "string")) {
                        throw new Error("graphQLArgs not a string");
                    }

                    return { tested: true };
                }
            }
        };

        const introspection = {
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
                Query: ["user"]
            }
        };

        const result = createLocalNode(RUNTIME)(introspection);

        expect(result).to.be.a.instanceOf(GraphQLNode);

        expect(result.resolvers.Query.user).to.be.a("function");

        const calledResolver = await result.resolvers.Query.user();

        expect(calledResolver)
            .to.be.a("object")
            .to.have.property("tested")
            .to.equal(true);
    });

    it("should create a instance of GraphQLNode with a Subscription resolver", async () => {
        const RUNTIME = {
            serviceManagers: {
                node: {
                    User: {
                        getNextService: () => "User:gateway:uuid"
                    }
                }
            },
            GraphQLNode,
            broker: {
                call: (service, { graphQLArgs }) => {
                    if (service !== "User:gateway:uuid:Subscription.user") {
                        throw new Error("serviceToCall invalid");
                    }

                    if (!(typeof graphQLArgs === "string")) {
                        throw new Error("graphQLArgs not a string");
                    }

                    async function* gen() {
                        yield { tested: true };
                    }

                    return iteratorToStream(gen());
                }
            }
        };

        const introspection = {
            name: "User",
            typeDefs: `
                type User {
                    name: String
                }

                type Subscription {
                    user: User
                }
            `,
            resolvers: {
                Subscription: ["user"]
            }
        };

        const result = createLocalNode(RUNTIME)(introspection);

        expect(result).to.be.a.instanceOf(GraphQLNode);

        expect(result.resolvers.Subscription.user)
            .to.be.a("object")
            .to.have.property("subscribe")
            .to.be.a("function");

        let calledResolver;

        for await (const chunk of await result.resolvers.Subscription.user.subscribe()) {
            calledResolver = chunk;
        }

        expect(calledResolver)
            .to.be.a("object")
            .to.have.property("tested")
            .to.equal(true);
    });

    it("should Request timed out", async () => {
        const RUNTIME = {
            serviceManagers: {
                node: {
                    User: {
                        getNextService: () => null
                    }
                }
            },
            GraphQLNode,
            broker: {
                call: () => {}
            }
        };

        const introspection = {
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
                Query: ["user"]
            }
        };

        const result = createLocalNode(RUNTIME)(introspection);

        expect(result).to.be.a.instanceOf(GraphQLNode);

        expect(result.resolvers.Query.user).to.be.a("function");

        try {
            await result.resolvers.Query.user();

            throw new Error();
        } catch ({ message }) {
            expect(message).to.be.a("string").to.contain("Request timed out");
        }
    });

    it("should throw error from another service", async () => {
        const RUNTIME = {
            serviceManagers: {
                node: {
                    User: {
                        getNextService: () => "User:gateway:uuid"
                    }
                }
            },
            GraphQLNode,
            broker: {
                call: (service, { graphQLArgs }) => {
                    if (service !== "User:gateway:uuid:Query.user") {
                        throw new Error("serviceToCall invalid");
                    }

                    if (!(typeof graphQLArgs === "string")) {
                        throw new Error("graphQLArgs not a string");
                    }

                    throw new Error("testing");
                }
            }
        };

        const introspection = {
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
                Query: ["user"]
            }
        };

        const result = createLocalNode(RUNTIME)(introspection);

        expect(result).to.be.a.instanceOf(GraphQLNode);

        expect(result.resolvers.Query.user).to.be.a("function");

        try {
            await result.resolvers.Query.user();

            throw new Error();
        } catch ({ message }) {
            expect(message).to.be.a("string").to.contain("testing");
        }
    });
});
