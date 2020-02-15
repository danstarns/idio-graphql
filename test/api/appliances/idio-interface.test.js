const { expect } = require("chai");
const { IdioInterface } = require("../../../src/index.js");
const gql = require("graphql-tag");

describe("IdioInterface", () => {
    it("should throw name required", () => {
        try {
            const interface = new IdioInterface();
        } catch (error) {
            expect(error.message).to.contain("name required");
        }
    });

    it("should throw nma emus tbe of type string", () => {
        try {
            const interface = new IdioInterface({ name: 1678 });
        } catch (error) {
            expect(error.message).to.contain("name must be of type 'string'");
        }
    });

    it("should throw creating interface with invalid name", () => {
        try {
            const interface = new IdioInterface({ name: "interface" });
        } catch (error) {
            expect(error.message).to.contain(
                "constructing IdioInterface: 'interface' with invalid name."
            );
        }
    });

    it("should throw error when parsing typedefs", () => {
        try {
            const interface = new IdioInterface({
                name: "MyInterface",
                typeDefs: `some invalid graphql sdl`
            });
        } catch (error) {
            expect(error.message).to.contain("cannot resolve typeDefs");
        }
    });

    it("should throw error when creating interface without a resolver", () => {
        try {
            const interface = new IdioInterface({
                name: "MyInterface",
                typeDefs: gql`
                    interface MyInterface {
                        message: String
                        code: Int
                    }
                `,
                resolver: { __resolveType: () => true }
            });
        } catch (error) {
            expect(error.message).to.contain("without resolver.");
        }
    });

    it("should throw error when creating interface without a resolver __resolveType property", () => {
        try {
            const interface = new IdioInterface({
                name: "MyInterface",
                typeDefs: `interface MyInterface {
        message: String
        code: Int
    }`,
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

    it("should create and return a instance of IdioInterface", () => {
        const interface = new IdioInterface({
            name: "MyInterface",
            typeDefs: `interface MyInterface {
        message: String
        code: Int
    }`,
            resolver: {
                __resolveType: () => true
            }
        });

        expect(interface).to.be.instanceOf(IdioInterface);

        expect(interface)
            .to.have.property("name")
            .to.be.a("string")
            .to.contain("MyInterface");

        expect(interface)
            .to.have.property("typeDefs")
            .to.be.a("string");

        expect(interface)
            .to.have.property("resolver")
            .to.be.a("object")
            .to.have.property("__resolveType")
            .to.be.a("function");
    });
});
