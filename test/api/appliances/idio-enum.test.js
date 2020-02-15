/* eslint-disable no-unused-vars */
const { expect } = require("chai");

const { IdioEnum } = require("../../../src");

describe("IdioEnum", () => {
    it("should throw constructing IdioEnum name required", () => {
        try {
            const _enum = new IdioEnum();

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "constructing IdioEnum name required"
            );
        }
    });

    it("should throw constructing IdioEnum name must be of type 'string'", () => {
        try {
            const _enum = new IdioEnum({ name: [] });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "constructing IdioEnum name must be of type 'string'"
            );
        }
    });

    it("should throw typDefs required", () => {
        try {
            const _enum = new IdioEnum({ name: "Test" });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "constructing IdioEnum: 'Test' typeDefs required."
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

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "constructing IdioEnum: 'Test' \n"
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

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "constructing IdioEnum: 'Test' without a resolver"
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
            .to.be.a("string");

        expect(_enum)
            .to.have.property("name")
            .to.contain("Test");

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
                "constructing IdioEnum: 'enum' with invalid name"
            );
        }
    });
});
