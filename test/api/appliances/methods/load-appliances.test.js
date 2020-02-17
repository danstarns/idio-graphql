const { expect } = require("chai");
const loadAppliances = require("../../../../src/api/appliances/methods/load-appliances.js");

describe("loadAppliances", () => {
    it("should throw expected scalars to be an array", () => {
        try {
            loadAppliances({}, { name: "scalars" });

            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("expected 'scalars' to be an array");
        }
    });

    it("should load single schemaGlobals", () => {
        const { typeDefs } = loadAppliances(`type User {name: String}`, {
            name: "schemaGlobals"
        });

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type User");
    });

    it("should load an array of schemaGlobals", () => {
        const { typeDefs } = loadAppliances([`type User {name: String}`], {
            name: "schemaGlobals"
        });

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type User");
    });

    it("should load a scalar", () => {
        const { typeDefs, resolvers } = loadAppliances(
            [
                {
                    name: "Test",
                    typeDefs: `scalar Test`,
                    resolver: () => ({ test: true })
                }
            ],
            {
                name: "scalars"
            }
        );

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("scalar Test");

        expect(resolvers)
            .to.be.a("object")
            .to.have.property("Test")
            .to.be.a("function");

        expect(resolvers.Test()).to.eql({ test: true });
    });

    it("should load 2 scalars", () => {
        const { typeDefs, resolvers } = loadAppliances(
            [
                {
                    name: "Test",
                    typeDefs: `scalar Test`,
                    resolver: () => ({ test: true })
                },
                {
                    name: "Test2",
                    typeDefs: `scalar Test2`,
                    resolver: () => ({ test: true })
                }
            ],
            {
                name: "scalars"
            }
        );

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("scalar Test");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("scalar Test2");

        expect(resolvers)
            .to.be.a("object")
            .to.have.property("Test")
            .to.be.a("function");

        expect(resolvers)
            .to.be.a("object")
            .to.have.property("Test2")
            .to.be.a("function");

        expect(resolvers.Test()).to.eql({ test: true });

        expect(resolvers.Test2()).to.eql({ test: true });
    });
});
