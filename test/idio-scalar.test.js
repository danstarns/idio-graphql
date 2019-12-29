/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-unused-vars */
const { expect } = require("chai");

const { SOURCE_PATH = "../src" } = process.env;

const { IdioScalar } = require(SOURCE_PATH);

describe("IdioScalar", () => {
    it("should throw constructing IdioScalar name required", () => {
        try {
            const scalar = new IdioScalar();

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "constructing IdioScalar name required"
            );
        }
    });

    it("should throw constructing IdioScalar name must be of type 'string'", () => {
        try {
            const scalar = new IdioScalar({ name: [] });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "constructing IdioScalar name must be of type 'string'"
            );
        }
    });

    it("should throw constructing IdioScalar: 'test' without resolver", () => {
        try {
            const scalar = new IdioScalar({ name: "test" });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "constructing IdioScalar: 'test' without resolver"
            );
        }
    });

    it("should create and return a instance of IdioScalar", () => {
        const scalar = new IdioScalar({ name: "test", resolver: () => true });

        expect(scalar)
            .to.have.property("name")
            .to.contain("test");

        expect(scalar)
            .to.have.property("resolver")
            .to.be.a("function");
    });

    it("should throw with invalid name", () => {
        try {
            const scalar = new IdioScalar({
                name: "scalar",
                resolver: () => true
            });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "constructing IdioScalar: 'scalar' with invalid name"
            );
        }
    });
});
