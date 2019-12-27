/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-unused-vars */
const { expect } = require("chai");

const { SOURCE_PATH = "src" } = process.env;

const IdioEnum = require(`../${SOURCE_PATH}/idio-enum.js`);

describe("IdioEnum", () => {
    it("should throw IdioEnum: name required", () => {
        try {
            const _enum = new IdioEnum();
        } catch (error) {
            expect(error.message).to.equal("IdioEnum: name required");
        }
    });

    it("should throw IdioEnum: name must be of type 'string'", () => {
        try {
            const _enum = new IdioEnum({ name: [] });
        } catch (error) {
            expect(error.message).to.equal(
                "IdioEnum: name must be of type 'string'"
            );
        }
    });

    it("should throw typDefs required", () => {
        try {
            const _enum = new IdioEnum({ name: "Test" });
        } catch (error) {
            expect(error.message).to.contain(
                "IdioEnum: creating Enum: 'Test' typeDefs required"
            );
        }
    });

    it("should throw an error when parsing invalid typeDefs", () => {
        try {
            const _enum = new IdioEnum({
                name: "Test",
                typeDefs: `
                enerm User {
                    TEST
                    TEST1
                    TEST2
                `
            });
        } catch (error) {
            expect(error.message).to.contain(
                "IdioEnum: creating Enum: 'Test' Error: "
            );
        }
    });

    it("should throw resolver required", () => {
        try {
            const _enum = new IdioEnum({
                name: "Test",
                typeDefs: `
                enum Test {
                    TEST
                    TEST1
                    TEST2
                }
                `
            });
        } catch (error) {
            expect(error.message).to.contain(
                "IdioEnum: creating Enum: 'Test' without a resolver"
            );
        }
    });

    it("should create and return a instance of IdioEnum", () => {
        const _enum = new IdioEnum({
            name: "Test",
            typeDefs: `
            enum Test {
                TEST
                TEST1
                TEST2
            }
            `,
            resolver: {}
        });

        expect(_enum)
            .to.have.property("typeDefs")
            .to.be.a("function");

        expect(_enum)
            .to.have.property("name")
            .to.equal("Test");

        expect(_enum).to.have.property("resolver");
    });

    it("should throw creating enum: with invalid name", () => {
        try {
            const _enum = new IdioEnum({
                name: "enum",
                typeDefs: `
                enum enum {
                    TEST
                    TEST1
                    TEST2
                }
                `,
                resolver: {}
            });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "IdioEnum: creating enum: 'enum' with invalid name"
            );
        }
    });
});
