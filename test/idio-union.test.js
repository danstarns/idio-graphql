const { expect } = require("chai");
const { IdioUnion } = require("../src/index.js");

describe("IdioUnion", () => {
    it("should throw name required", () => {
        try {
            const union = new IdioUnion();
        } catch (error) {
            expect(error.message).to.contain("name required");
        }
    });

    it("should throw nma emus tbe of type string", () => {
        try {
            const union = new IdioUnion({ name: 1678 });
        } catch (error) {
            expect(error.message).to.contain("name must be of type 'string'");
        }
    });

    it("should throw creating union with invalid name", () => {
        try {
            const union = new IdioUnion({ name: "union" });
        } catch (error) {
            expect(error.message).to.contain(
                "constructing IdioUnion: 'union' with invalid name."
            );
        }
    });

    it("should throw error when parsing typedefs", () => {
        try {
            const union = new IdioUnion({
                name: "MyUnion",
                typeDefs: `some invalid graphql sdl`
            });
        } catch (error) {
            expect(error.message).to.contain("cannot resolve typeDefs");
        }
    });

    it("should throw error when creating union without a resolver", () => {
        try {
            const AOrB = new IdioUnion({
                name: "AOrB",
                typeDefs: `union AOrB = A | B`
            });
        } catch (error) {
            expect(error.message).to.contain("without resolver.");
        }
    });

    it("should throw error when creating union without a resolver __resolveType property", () => {
        try {
            const AOrB = new IdioUnion({
                name: "AOrB",
                typeDefs: `union AOrB = A | B`,
                resolver: {
                    abc: () => true
                }
            });
        } catch (error) {
            expect(error.message).to.contain(
                "must have a __resolveType property."
            );
        }
    });

    it("should create and return a instance of IdioUnion", () => {
        const AOrB = new IdioUnion({
            name: "AOrB",
            typeDefs: `union AOrB = A | B`,
            resolver: {
                __resolveType: () => true
            }
        });

        expect(AOrB).to.be.instanceOf(IdioUnion);

        expect(AOrB)
            .to.have.property("name")
            .to.be.a("string")
            .to.contain("AOrB");

        expect(AOrB)
            .to.have.property("typeDefs")
            .to.be.a("string");

        expect(AOrB)
            .to.have.property("resolver")
            .to.be.a("object")
            .to.have.property("__resolveType")
            .to.be.a("function");
    });
});
