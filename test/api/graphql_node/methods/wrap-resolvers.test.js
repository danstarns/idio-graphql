const { expect } = require("chai");

const wrapResolvers = require("../../../../src/api/graphql_node/methods/wrap-resolvers.js");
const INDEX = require("../../../../src/constants/context-index.js");

describe("wrapResolvers", () => {
    it("should only inject if it is a function", async () => {
        const node = {
            name: "User",
            resolvers: {
                Query: {
                    user: (...args) => {
                        const context = args[INDEX];

                        if (!context.injections) {
                            throw new Error("injections missing ");
                        }

                        return { tested: true };
                    }
                }
            },
            injections: {
                testing: "true"
            }
        };

        const { Query } = wrapResolvers(node);

        expect(Query)
            .to.be.a("object")
            .to.have.property("user")
            .to.be.a("function");

        expect(await Query.user())
            .to.be.a("object")
            .to.have.property("tested")
            .to.equal(true);
    });

    it("should inject multiple functions", async () => {
        const node = {
            name: "User",
            resolvers: {
                Query: {
                    user: (...args) => {
                        const context = args[INDEX];

                        if (!context.injections) {
                            throw new Error("injections missing ");
                        }

                        return { tested: true };
                    },
                    post: (...args) => {
                        const context = args[INDEX];

                        if (!context.injections) {
                            throw new Error("injections missing ");
                        }

                        return { tested: true };
                    }
                }
            },
            injections: {
                testing: "true"
            }
        };

        const { Query } = wrapResolvers(node);

        expect(Query)
            .to.be.a("object")
            .to.have.property("user")
            .to.be.a("function");

        expect(await Query.user({}, {}, {}, {}))
            .to.be.a("object")
            .to.have.property("tested")
            .to.equal(true);

        expect(await Query.post({}, {}, {}, {}))
            .to.be.a("object")
            .to.have.property("tested")
            .to.equal(true);
    });

    it("should wrap pre and post methods", async () => {
        const node = {
            name: "User",
            resolvers: {
                Query: {
                    user: {
                        pre: [
                            (...args) => {
                                const context = args[INDEX];

                                if (!context.injections) {
                                    throw new Error("injections missing ");
                                }
                            }
                        ],
                        resolve: (...args) => {
                            const context = args[INDEX];

                            if (!context.injections) {
                                throw new Error("injections missing ");
                            }

                            return { tested: true };
                        },
                        post: [
                            (...args) => {
                                if (!args[0].tested) {
                                    throw new Error("injections not preserved");
                                }

                                const context = args[INDEX + 1];

                                if (!context.injections) {
                                    throw new Error("injections missing ");
                                }
                            }
                        ]
                    }
                }
            },
            injections: {
                testing: "true"
            }
        };

        const { Query } = wrapResolvers(node);

        expect(Query)
            .to.be.a("object")
            .to.have.property("user")
            .to.be.a("function");

        expect(await Query.user())
            .to.be.a("object")
            .to.have.property("tested")
            .to.equal(true);
    });

    it("should only inject if it is a function on a subscription", async () => {
        const node = {
            name: "User",
            resolvers: {
                Subscription: {
                    user: {
                        async *subscribe(...args) {
                            const context = args[INDEX];

                            if (!context.injections) {
                                throw new Error("injections missing");
                            }

                            yield { tested: true };
                        }
                    }
                }
            },
            injections: {
                testing: "true"
            }
        };

        const { Subscription } = wrapResolvers(node);

        expect(Subscription)
            .to.be.a("object")
            .to.have.property("user")
            .to.be.a("object")
            .to.have.property("subscribe")
            .to.be.a("function");

        let result;

        // eslint-disable-next-line no-restricted-syntax
        for await (const chunk of await Subscription.user.subscribe(
            {},
            {},
            {},
            {}
        )) {
            result = chunk;
        }

        expect(result)
            .to.be.a("object")
            .to.have.property("tested")
            .to.equal(true);
    });

    it("should only inject if it is a function on a subscription and catch an error", async () => {
        const node = {
            name: "User",
            resolvers: {
                Subscription: {
                    user: {
                        // eslint-disable-next-line require-yield
                        async *subscribe(...args) {
                            const context = args[INDEX];

                            if (!context.injections) {
                                throw new Error("injections missing");
                            }

                            throw new Error("testing");
                        }
                    }
                }
            },
            injections: {
                testing: "true"
            }
        };

        const { Subscription } = wrapResolvers(node);

        expect(Subscription)
            .to.be.a("object")
            .to.have.property("user")
            .to.be.a("object")
            .to.have.property("subscribe")
            .to.be.a("function");

        try {
            // eslint-disable-next-line no-restricted-syntax
            // eslint-disable-next-line no-empty
            for await (const chunk of await Subscription.user.subscribe()) {
            }
        } catch ({ message }) {
            expect(message).to.be.a("string").to.contain("testing");
        }
    });

    it("Should throw resolver that requires a 'resolve' method", () => {
        try {
            const node = {
                name: "User",
                resolvers: {
                    Query: {
                        user: { abc: 123 }
                    }
                },
                injections: {
                    testing: "true"
                }
            };

            wrapResolvers(node);

            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("requires a 'resolve' method");
        }
    });
});
