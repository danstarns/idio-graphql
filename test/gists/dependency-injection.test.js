/* eslint-disable import/no-dynamic-require */
const { SOURCE_PATH = "../../src/index.js" } = process.env;
const { expect } = require("chai");

const { GraphQLNode, combineNodes } = require(SOURCE_PATH);

describe("gists/dependency-injection", () => {
    it("should verify dependency injection with a initial object", async () => {
        let result;

        const User = new GraphQLNode({
            name: "User",
            typeDefs: `type User {
                name: String
            }
            
            type Query {
                user: User
            }`,
            injections: {
                song: "the cat"
            },
            resolvers: {
                Query: {
                    user: {
                        pre: (...args) => {
                            args[2].injections.song += " jumped";
                        },
                        resolve: (...args) => {
                            args[2].injections.song += " over the";
                        },
                        post: (...args) => {
                            args[3].injections.song += " moon";

                            result = args[3].injections.song;
                        }
                    }
                }
            }
        });

        const { typeDefs, resolvers } = await combineNodes([User]);

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type User");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type Query");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("schema");

        expect(resolvers)
            .to.be.a("object")
            .to.have.property("Query")
            .to.be.a("object")
            .to.have.property("user")
            .to.be.a("function");

        await resolvers.Query.user(undefined, {}, {});

        expect(result).to.equal("the cat jumped over the moon");
    });

    it("should verify dependency injection with a subscriptions", async () => {
        let result;

        const User = new GraphQLNode({
            name: "User",
            typeDefs: `type User {
                name: String
            }
            
            type Subscription {
                userUpdate: User
            }`,
            injections: {
                song: "the cat"
            },
            resolvers: {
                Subscription: {
                    userUpdate: {
                        pre: (...args) => {
                            args[2].injections.song += " jumped";
                        },
                        resolve: {
                            subscribe: (...args) => {
                                args[2].injections.song += " over the";
                            },
                            otherMethod: () => 1
                        },
                        post: (...args) => {
                            args[3].injections.song += " moon";

                            result = args[3].injections.song;
                        }
                    }
                }
            }
        });

        const { typeDefs, resolvers } = await combineNodes([User]);

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type User");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type Subscription");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("schema");

        expect(resolvers)
            .to.be.a("object")
            .to.have.property("Subscription")
            .to.be.a("object")
            .to.have.property("userUpdate")
            .to.be.a("object")
            .to.have.property("subscribe")
            .to.be.a("function");

        expect(resolvers)
            .to.be.a("object")
            .to.have.property("Subscription")
            .to.be.a("object")
            .to.have.property("userUpdate")
            .to.be.a("object")
            .to.have.property("otherMethod")
            .to.be.a("function");

        await resolvers.Subscription.userUpdate.subscribe(undefined, {}, {});

        expect(result).to.equal("the cat jumped over the moon");
    });

    it("should verify dependency injection with a subscriptions", async () => {
        let result;

        const User = new GraphQLNode({
            name: "User",
            typeDefs: `type User {
                name: String
            }
            
            type Subscription {
                userUpdate: User
            }`,
            injections: {
                song: "the cat"
            },
            resolvers: {
                Subscription: {
                    userUpdate: {
                        resolve: {
                            subscribe: (...args) => {
                                args[2].injections.song +=
                                    " jumped over the moon";
                                result = args[2].injections.song;
                            },
                            otherMethod: () => 1
                        }
                    }
                }
            }
        });

        const { typeDefs, resolvers } = await combineNodes([User]);

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type User");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type Subscription");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("schema");

        expect(resolvers)
            .to.be.a("object")
            .to.have.property("Subscription")
            .to.be.a("object")
            .to.have.property("userUpdate")
            .to.be.a("object")
            .to.have.property("subscribe")
            .to.be.a("function");

        expect(resolvers)
            .to.be.a("object")
            .to.have.property("Subscription")
            .to.be.a("object")
            .to.have.property("userUpdate")
            .to.be.a("object")
            .to.have.property("otherMethod")
            .to.be.a("function");

        await resolvers.Subscription.userUpdate.subscribe(undefined, {}, {});

        expect(result).to.equal("the cat jumped over the moon");
    });

    it("should verify dependency injection with a initial function", async () => {
        let result;

        const User = new GraphQLNode({
            name: "User",
            typeDefs: `type User {
                name: String
            }
            
            type Query {
                user: User
            }`,
            injections: () => ({
                song: "the cat"
            }),
            resolvers: {
                Query: {
                    user: {
                        pre: (...args) => {
                            args[2].injections.song += " jumped";
                        },
                        resolve: (...args) => {
                            args[2].injections.song += " over the";
                        },
                        post: (...args) => {
                            args[3].injections.song += " moon";

                            result = args[3].injections.song;
                        }
                    }
                }
            }
        });

        const { typeDefs, resolvers } = await combineNodes([User]);

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type User");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type Query");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("schema");

        expect(resolvers)
            .to.be.a("object")
            .to.have.property("Query")
            .to.be.a("object")
            .to.have.property("user")
            .to.be.a("function");

        await resolvers.Query.user(undefined, {}, {});

        expect(result).to.equal("the cat jumped over the moon");
    });

    it("should verify that the first argument to the post function(s) is the result of resolve", async () => {
        let result;

        const User = new GraphQLNode({
            name: "User",
            typeDefs: `type User {
            name: String
        }
        
        type Query {
            user: User
        }`,
            injections: {
                song: "the cat"
            },
            resolvers: {
                Query: {
                    user: {
                        resolve: () => "the cat jumped over the moon",
                        post: (resolved) => {
                            result = resolved;
                        }
                    }
                }
            }
        });

        const { typeDefs, resolvers } = await combineNodes([User]);

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type User");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type Query");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("schema");

        expect(resolvers)
            .to.be.a("object")
            .to.have.property("Query")
            .to.be.a("object")
            .to.have.property("user")
            .to.be.a("function");

        await resolvers.Query.user(undefined, {}, {});

        expect(result).to.equal("the cat jumped over the moon");
    });

    it("should catch and throw the error inside inject function", async () => {
        try {
            const User = new GraphQLNode({
                name: "User",
                typeDefs: `type User {
                name: String
            }
            
            type Query {
                user: User
            }`,
                injections: () => {
                    throw new Error("failed");
                },
                resolvers: {
                    Query: {
                        user: () => true
                    }
                }
            });

            await combineNodes([User]);

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "GraphQLNode with name: 'User' failed executing injections\nError: failed"
            );
        }
    });
});
