/* eslint-disable import/no-dynamic-require */
const { SOURCE_PATH = "../../src/index.js" } = process.env;
const { expect } = require("chai");

const { GraphQLNode, combineNodes } = require(SOURCE_PATH);

describe("gists/resolver-hooks", async () => {
    it("should share the context object between each hook", async () => {
        let result;

        const User = new GraphQLNode({
            name: "User",
            typeDefs: `type User {
                name: String
            }
            
            type Query {
                user: User
            }`,
            resolvers: {
                Query: {
                    user: {
                        pre: (...args) => {
                            args[2].song += " jumped";
                        },
                        resolve: (...args) => {
                            args[2].song += " over the";
                        },
                        post: (...args) => {
                            args[3].song += " moon";

                            result = args[3].song;
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

        await resolvers.Query.user(
            undefined,
            {},
            {
                song: "the cat"
            }
        );

        expect(result).to.equal("the cat jumped over the moon");
    });

    it("should share the context object between each hook", async () => {
        let result;

        const User = new GraphQLNode({
            name: "User",
            typeDefs: `type User {
                name: String
            }
            
            type Query {
                user: User
            }`,
            resolvers: {
                Query: {
                    user: {
                        pre: [
                            (...args) => {
                                args[2].song += " jumped";
                            }
                        ],
                        resolve: (...args) => {
                            args[2].song += " over the";
                        },
                        post: [
                            (...args) => {
                                args[3].song += " moon";

                                result = args[3].song;
                            }
                        ]
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

        await resolvers.Query.user(
            undefined,
            {},
            {
                song: "the cat"
            }
        );

        expect(result).to.equal("the cat jumped over the moon");
    });

    it("should throw GraphQLNode with name: 'User' has resolver that requires a 'resolve' method", async () => {
        try {
            const User = new GraphQLNode({
                name: "User",
                typeDefs: `type User {
                        name: String
                    }
                    
                    type Query {
                        user: User
                    }`,
                resolvers: {
                    Query: {
                        user: {}
                    }
                }
            });

            await combineNodes([User]);

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "GraphQLNode with name: 'User' has resolver.Query.user that requires a 'resolve' method"
            );
        }
    });
});
