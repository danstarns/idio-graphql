const { expect } = require("chai");
const proxyquire = require("proxyquire");
const CONTEXT_INDEX = require("../../../../src/constants/context-index.js");

function loadNode(n) {
    return n;
}

function execute(schema) {
    if (!schema.test) {
        throw new Error("no test");
    }

    return () => ({ test: true });
}

const reduceNodes = proxyquire(
    "../../../../src/api/combine_nodes/methods/reduce-nodes.js",
    {
        "../../graphql_node/methods/index.js": {
            loadNode
        },
        "../../../util/index.js": {
            execute: {
                withSchema: execute
            }
        }
    }
);

describe("reduceNodes", () => {
    it("should reduce a node", () => {
        const nodes = [
            {
                name: "User",
                typeDefs: "type User {name: String}",
                resolvers: {
                    Query: {
                        user: (...args) => {
                            if (!args[CONTEXT_INDEX].injections) {
                                throw new Error("no injections");
                            }

                            if (!args[CONTEXT_INDEX].injections.execute) {
                                throw new Error("no execute");
                            }

                            return { test: true };
                        }
                    }
                }
            }
        ];

        const RUNTIME = {
            schema: {
                test: true
            }
        };

        const result = reduceNodes(nodes, RUNTIME);

        expect(result)
            .to.be.a("object")
            .to.have.property("typeDefs")
            .to.contain("type User {name: String}");

        expect(result)
            .to.be.a("object")
            .to.have.property("resolvers")
            .to.be.a("object")
            .to.have.property("Query")
            .to.be.a("object")
            .to.have.property("user")
            .to.be.a("function");

        const tested = result.resolvers.Query.user();

        expect(tested).to.be.a("object").to.have.property("test");
    });

    it("should reduce a node with fields and add existing injections", () => {
        const nodes = [
            {
                name: "User",
                typeDefs: "type User {name: String}",
                resolvers: {
                    Fields: {
                        name: (...args) => {
                            if (!args[CONTEXT_INDEX].injections) {
                                throw new Error("no injections");
                            }

                            if (!args[CONTEXT_INDEX].injections.execute) {
                                throw new Error("no execute");
                            }

                            if (!args[CONTEXT_INDEX].injections.test) {
                                throw new Error("no test");
                            }

                            return { test: true };
                        }
                    },
                    Query: {
                        user: (...args) => {
                            if (!args[CONTEXT_INDEX].injections) {
                                throw new Error("no injections");
                            }

                            if (!args[CONTEXT_INDEX].injections.execute) {
                                throw new Error("no execute");
                            }

                            return { test: true };
                        }
                    }
                }
            }
        ];

        const RUNTIME = {
            schema: {
                test: true
            }
        };

        const result = reduceNodes(nodes, RUNTIME);

        expect(result)
            .to.be.a("object")
            .to.have.property("typeDefs")
            .to.contain("type User {name: String}");

        expect(result)
            .to.be.a("object")
            .to.have.property("resolvers")
            .to.be.a("object")
            .to.have.property("Query")
            .to.be.a("object")
            .to.have.property("user")
            .to.be.a("function");

        expect(result)
            .to.be.a("object")
            .to.have.property("resolvers")
            .to.be.a("object")
            .to.have.property("User")
            .to.be.a("object")
            .to.have.property("name")
            .to.be.a("function");

        const testArgs = Array(10).fill({});

        testArgs[CONTEXT_INDEX] = { injections: { test: true } };

        const tested = result.resolvers.Query.user();
        const tested2 = result.resolvers.User.name(...testArgs);

        expect(tested).to.be.a("object").to.have.property("test");

        expect(tested2).to.be.a("object").to.have.property("test");
    });

    it("should reduce a node with subscriptions", () => {
        const nodes = [
            {
                name: "User",
                typeDefs: "type User {name: String}",
                resolvers: {
                    Subscription: {
                        user: {
                            subscribe: (...args) => {
                                if (!args[CONTEXT_INDEX].injections) {
                                    throw new Error("no injections");
                                }

                                if (!args[CONTEXT_INDEX].injections.execute) {
                                    throw new Error("no execute");
                                }

                                return { test: true };
                            }
                        }
                    }
                }
            }
        ];

        const RUNTIME = {
            schema: {
                test: true
            }
        };

        const result = reduceNodes(nodes, RUNTIME);

        expect(result)
            .to.be.a("object")
            .to.have.property("typeDefs")
            .to.contain("type User {name: String}");

        expect(result)
            .to.be.a("object")
            .to.have.property("resolvers")
            .to.be.a("object")
            .to.have.property("Subscription")
            .to.be.a("object")
            .to.have.property("user")
            .to.be.a("object")
            .to.have.property("subscribe")
            .to.be.a("function");

        const testArgs = Array(10).fill({});

        testArgs[CONTEXT_INDEX] = { injections: { test: true } };

        const tested = result.resolvers.Subscription.user.subscribe(
            ...testArgs
        );

        expect(tested).to.be.a("object").to.have.property("test");
    });

    it("should reduce a node and turn injections into empty object if not there", () => {
        const nodes = [
            {
                name: "User",
                typeDefs: "type User {name: String}",
                resolvers: {
                    Subscription: {
                        user: {
                            subscribe: (...args) => {
                                if (!args[CONTEXT_INDEX].injections) {
                                    throw new Error("no injections");
                                }

                                if (!args[CONTEXT_INDEX].injections.execute) {
                                    throw new Error("no execute");
                                }

                                return { test: true };
                            }
                        }
                    }
                }
            }
        ];

        const RUNTIME = {
            schema: {
                test: true
            }
        };

        const result = reduceNodes(nodes, RUNTIME);

        expect(result)
            .to.be.a("object")
            .to.have.property("typeDefs")
            .to.contain("type User {name: String}");

        expect(result)
            .to.be.a("object")
            .to.have.property("resolvers")
            .to.be.a("object")
            .to.have.property("Subscription")
            .to.be.a("object")
            .to.have.property("user")
            .to.be.a("object")
            .to.have.property("subscribe")
            .to.be.a("function");

        const testArgs = Array(1).fill({});

        const tested = result.resolvers.Subscription.user.subscribe(
            ...testArgs
        );

        expect(tested).to.be.a("object").to.have.property("test");
    });

    it("should reduce a node and turn injections into empty object if not a object", () => {
        const nodes = [
            {
                name: "User",
                typeDefs: "type User {name: String}",
                resolvers: {
                    Subscription: {
                        user: {
                            subscribe: (...args) => {
                                if (!args[CONTEXT_INDEX].injections) {
                                    throw new Error("no injections");
                                }

                                if (!args[CONTEXT_INDEX].injections.execute) {
                                    throw new Error("no execute");
                                }

                                return { test: true };
                            }
                        }
                    }
                }
            }
        ];

        const RUNTIME = {
            schema: {
                test: true
            }
        };

        const result = reduceNodes(nodes, RUNTIME);

        expect(result)
            .to.be.a("object")
            .to.have.property("typeDefs")
            .to.contain("type User {name: String}");

        expect(result)
            .to.be.a("object")
            .to.have.property("resolvers")
            .to.be.a("object")
            .to.have.property("Subscription")
            .to.be.a("object")
            .to.have.property("user")
            .to.be.a("object")
            .to.have.property("subscribe")
            .to.be.a("function");

        const testArgs = Array(10).fill({});

        testArgs[CONTEXT_INDEX] = { injections: 1 };

        const tested = result.resolvers.Subscription.user.subscribe(
            ...testArgs
        );

        expect(tested).to.be.a("object").to.have.property("test");
    });

    it("should reduce a node nested nodes", () => {
        const nodes = [
            {
                name: "User",
                typeDefs: "type User {name: String}",
                resolvers: {
                    Fields: {
                        name: (...args) => {
                            if (!args[CONTEXT_INDEX].injections) {
                                throw new Error("no injections");
                            }

                            if (!args[CONTEXT_INDEX].injections.execute) {
                                throw new Error("no execute");
                            }

                            if (!args[CONTEXT_INDEX].injections.test) {
                                throw new Error("no test");
                            }

                            return { test: true };
                        }
                    },
                    Query: {
                        user: (...args) => {
                            if (!args[CONTEXT_INDEX].injections) {
                                throw new Error("no injections");
                            }

                            if (!args[CONTEXT_INDEX].injections.execute) {
                                throw new Error("no execute");
                            }

                            return { test: true };
                        }
                    }
                },
                nodes: [
                    {
                        name: "Post",
                        typeDefs: "type Post {title: String}",
                        resolvers: {
                            Fields: {
                                title: (...args) => {
                                    if (!args[CONTEXT_INDEX].injections) {
                                        throw new Error("no injections");
                                    }

                                    if (
                                        !args[CONTEXT_INDEX].injections.execute
                                    ) {
                                        throw new Error("no execute");
                                    }

                                    if (!args[CONTEXT_INDEX].injections.test) {
                                        throw new Error("no test");
                                    }

                                    return { test: true };
                                }
                            },
                            Query: {
                                post: (...args) => {
                                    if (!args[CONTEXT_INDEX].injections) {
                                        throw new Error("no injections");
                                    }

                                    if (
                                        !args[CONTEXT_INDEX].injections.execute
                                    ) {
                                        throw new Error("no execute");
                                    }

                                    return { test: true };
                                }
                            }
                        }
                    }
                ]
            }
        ];

        const RUNTIME = {
            schema: {
                test: true
            }
        };

        const result = reduceNodes(nodes, RUNTIME);

        expect(result)
            .to.be.a("object")
            .to.have.property("typeDefs")
            .to.contain("type User {name: String}");

        expect(result)
            .to.be.a("object")
            .to.have.property("typeDefs")
            .to.contain("type Post {title: String}");

        expect(result)
            .to.be.a("object")
            .to.have.property("resolvers")
            .to.be.a("object")
            .to.have.property("Query")
            .to.be.a("object")
            .to.have.property("user")
            .to.be.a("function");

        expect(result)
            .to.be.a("object")
            .to.have.property("resolvers")
            .to.be.a("object")
            .to.have.property("Query")
            .to.be.a("object")
            .to.have.property("post")
            .to.be.a("function");

        expect(result)
            .to.be.a("object")
            .to.have.property("resolvers")
            .to.be.a("object")
            .to.have.property("Post")
            .to.be.a("object")
            .to.have.property("title")
            .to.be.a("function");

        const testArgs = Array(10).fill({});

        testArgs[CONTEXT_INDEX] = { injections: { test: true } };

        const tested = result.resolvers.Query.user();
        const tested2 = result.resolvers.Post.title(...testArgs);

        expect(tested).to.be.a("object").to.have.property("test");

        expect(tested2).to.be.a("object").to.have.property("test");
    });

    it("should reduce multiple nodes", () => {
        const nodes = [
            {
                name: "User",
                typeDefs: "type User {name: String}",
                resolvers: {
                    Fields: {
                        name: (...args) => {
                            if (!args[CONTEXT_INDEX].injections) {
                                throw new Error("no injections");
                            }

                            if (!args[CONTEXT_INDEX].injections.execute) {
                                throw new Error("no execute");
                            }

                            if (!args[CONTEXT_INDEX].injections.test) {
                                throw new Error("no test");
                            }

                            return { test: true };
                        }
                    },
                    Query: {
                        user: (...args) => {
                            if (!args[CONTEXT_INDEX].injections) {
                                throw new Error("no injections");
                            }

                            if (!args[CONTEXT_INDEX].injections.execute) {
                                throw new Error("no execute");
                            }

                            return { test: true };
                        }
                    }
                }
            },
            {
                name: "Post",
                typeDefs: "type Post {title: String}",
                resolvers: {
                    Fields: {
                        title: (...args) => {
                            if (!args[CONTEXT_INDEX].injections) {
                                throw new Error("no injections");
                            }

                            if (!args[CONTEXT_INDEX].injections.execute) {
                                throw new Error("no execute");
                            }

                            if (!args[CONTEXT_INDEX].injections.test) {
                                throw new Error("no test");
                            }

                            return { test: true };
                        }
                    },
                    Query: {
                        post: (...args) => {
                            if (!args[CONTEXT_INDEX].injections) {
                                throw new Error("no injections");
                            }

                            if (!args[CONTEXT_INDEX].injections.execute) {
                                throw new Error("no execute");
                            }

                            return { test: true };
                        }
                    }
                }
            }
        ];

        const RUNTIME = {
            schema: {
                test: true
            }
        };

        const result = reduceNodes(nodes, RUNTIME);

        expect(result)
            .to.be.a("object")
            .to.have.property("typeDefs")
            .to.contain("type User {name: String}");

        expect(result)
            .to.be.a("object")
            .to.have.property("typeDefs")
            .to.contain("type Post {title: String}");

        expect(result)
            .to.be.a("object")
            .to.have.property("resolvers")
            .to.be.a("object")
            .to.have.property("Query")
            .to.be.a("object")
            .to.have.property("user")
            .to.be.a("function");

        expect(result)
            .to.be.a("object")
            .to.have.property("resolvers")
            .to.be.a("object")
            .to.have.property("Query")
            .to.be.a("object")
            .to.have.property("post")
            .to.be.a("function");

        expect(result)
            .to.be.a("object")
            .to.have.property("resolvers")
            .to.be.a("object")
            .to.have.property("Post")
            .to.be.a("object")
            .to.have.property("title")
            .to.be.a("function");

        const testArgs = Array(10).fill({});

        testArgs[CONTEXT_INDEX] = { injections: { test: true } };

        const tested = result.resolvers.Query.user();
        const tested2 = result.resolvers.Post.title(...testArgs);

        expect(tested).to.be.a("object").to.have.property("test");

        expect(tested2).to.be.a("object").to.have.property("test");
    });
});
