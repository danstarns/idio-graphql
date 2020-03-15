/* eslint-disable no-unused-vars */
const { expect } = require("chai");

const { GraphQLType } = require("../../../src");

describe("GraphQLType", () => {
    it("should throw name required", () => {
        try {
            const type = new GraphQLType();

            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("name required");
        }
    });

    it("should throw name must be of type string", () => {
        try {
            const type = new GraphQLType({ name: [] });

            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("name must be of type 'string'");
        }
    });

    it("should throw invalid name", () => {
        try {
            const type = new GraphQLType({ name: "type" });

            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("invalid name");
        }
    });

    it("should throw typeDefs required", () => {
        try {
            const User = new GraphQLType({ name: "User" });

            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("typeDefs required");
        }
    });

    it("should throw cannot resolve typeDefs", () => {
        try {
            const badTypeDefs = `!!!!!!!!!!!!!!`;

            const User = new GraphQLType({
                name: "User",
                typeDefs: badTypeDefs
            });

            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("cannot resolve typeDefs");
        }
    });

    it("should throw typeDefs should contain type with name User", () => {
        try {
            const typeDefs = `
                type Fish {
                    eyes: Int
                }
            `;

            const User = new GraphQLType({
                name: "User",
                typeDefs
            });

            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain(
                    "GraphQLType with name: 'User' should contain a ObjectTypeDefinition called 'User'"
                );
        }
    });

    it("should throw resolvers required", () => {
        try {
            const typeDefs = `
                type User {
                    eyes: Int
                }
            `;

            const User = new GraphQLType({
                name: "User",
                typeDefs
            });

            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("resolvers required");
        }
    });

    it("should at least one resolver required", () => {
        try {
            const typeDefs = `
                type User {
                    eyes: Int
                }
            `;

            const User = new GraphQLType({
                name: "User",
                typeDefs,
                resolvers: {}
            });

            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("at least one resolver required");
        }
    });

    it("should throw requires a 'resolve' method", () => {
        try {
            const typeDefs = `
                type User {
                    eyes: Int
                }
            `;

            const User = new GraphQLType({
                name: "User",
                typeDefs,
                resolvers: {
                    eyes: {
                        test: true
                    }
                }
            });

            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("User.resolver.eyes requires a 'resolve' method");
        }
    });

    it("should throw feet not defined in typeDefs", () => {
        try {
            const typeDefs = `
                type User {
                    eyes: Int
                }
            `;

            const User = new GraphQLType({
                name: "User",
                typeDefs,
                resolvers: {
                    eyes: {
                        resolve: () => 2
                    },
                    feet: () => 2
                }
            });

            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("User.feet not defined in typeDefs");
        }
    });

    it("should return a instance of GraphQLType", async () => {
        const typeDefs = `
            type User {
                eyes: Int
                feet: Int
            }
        `;

        const User = new GraphQLType({
            name: "User",
            typeDefs,
            resolvers: {
                eyes: {
                    resolve: () => 2
                },
                feet: () => 2
            }
        });

        expect(User).to.be.a.instanceof(GraphQLType);

        expect(User)
            .to.have.property("typeDefs")
            .to.be.a("string")
            .to.contain("type User");

        expect(User)
            .to.have.property("resolvers")
            .to.be.a("object")
            .to.have.property("eyes")
            .to.be.a("function");

        expect(User)
            .to.have.property("resolvers")
            .to.be.a("object")
            .to.have.property("feet")
            .to.be.a("function");

        expect(await User.resolvers.eyes()).to.equal(2);

        expect(await User.resolvers.feet()).to.equal(2);
    });
});
