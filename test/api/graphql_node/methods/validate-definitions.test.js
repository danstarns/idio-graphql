const { expect } = require("chai");
const validateDefinitions = require("../../../../src/api/graphql_node/methods/validate-definitions.js");

describe("validateDefinitions", () => {
    it("should throw expect node resolvers to be of type object", () => {
        try {
            const node = {
                resolvers: 1
            };

            validateDefinitions(node);

            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("expected node resolvers to be of type 'object'");
        }
    });

    it("should throw at least one resolver required.", () => {
        try {
            const node = {
                resolvers: {}
            };

            validateDefinitions(node);

            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("at least one resolver required.");
        }
    });

    it("should throw invalid resolvers", () => {
        try {
            const node = {
                resolvers: { abc: {} }
            };

            validateDefinitions(node);

            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("invalid resolvers");
        }
    });

    it("should throw subscription must contain a subscribe method", () => {
        try {
            const node = {
                resolvers: { Subscription: { abc: {} } }
            };

            validateDefinitions(node);

            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("must contain a subscribe method");
        }
    });

    it("should throw could not parse typeDefs", () => {
        try {
            const node = {
                resolvers: { Query: { user: () => true } },
                typeDefs: `djdshdjkhj`
            };

            validateDefinitions(node);

            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("could not parse typeDefs");
        }
    });

    it("should throw Field resolver thats not defined in typeDefs", () => {
        try {
            const node = {
                name: "User",
                resolvers: { Fields: { age: () => true } },
                typeDefs: `
                type User {
                    name: String
                }`
            };

            validateDefinitions(node);

            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("Field resolver");

            expect(message)
                .to.be.a("string")
                .to.contain("not defined in typeDefs");
        }
    });

    it("should throw Query resolver thats not defined in resolvers", () => {
        try {
            const node = {
                name: "User",
                resolvers: { Query: { users: () => true } },
                typeDefs: `
                type User {
                    name: String
                }
                

                type Query {
                    users: [User]
                    user: user
                }
                `
            };

            validateDefinitions(node);

            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain(
                    "Query in the typeDefs called 'user' thats not defined in resolvers"
                );
        }
    });

    it("should throw Query resolver thats not defined in resolvers with (implements)", () => {
        try {
            const node = {
                name: "User",
                resolvers: { Query: { users: () => true } },
                typeDefs: `
                type User implements abc {
                    name: String
                }
                

                type Query {
                    users: [User]
                    user: user
                }
                `
            };

            validateDefinitions(node);

            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain(
                    "Query in the typeDefs called 'user' thats not defined in resolvers"
                );
        }
    });

    it("should throw Query resolver thats not defined in typeDefs", () => {
        try {
            const node = {
                name: "User",
                resolvers: {
                    Fields: {
                        name: () => true
                    },
                    Query: { users: () => true, user: () => true },
                    Subscription: {
                        userUpdate: {
                            subscribe: () => true
                        }
                    },
                    Mutation: {
                        updateUser: () => ture
                    }
                },
                typeDefs: `
                enum test {
                    abc
                }

                type User {
                    name: String
                }
                

                type Query {
                    users: [User]
                }

                type Mutation {
                    updateUser: User
                }
                
                type Subscription {
                    userUpdate: User
                }
                `
            };

            validateDefinitions(node);

            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain(
                    "has a Query resolver called 'user' thats not defined in typeDefs"
                );
        }
    });
});
