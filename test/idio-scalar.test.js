/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-unused-vars */
const { expect } = require("chai");

const { SOURCE_PATH = "src" } = process.env;

const IdioScalar = require(`../${SOURCE_PATH}/idio-scalar.js`);

describe("IdioScalar", () => {
    it("should throw IdioScalar: name required", () => {
        try {
            const scalar = new IdioScalar();
        } catch (error) {
            expect(error.message).to.equal("IdioScalar: name required");
        }
    });

    it("should throw IdioScalar: name must be of type 'string'", () => {
        try {
            const scalar = new IdioScalar({ name: [] });
        } catch (error) {
            expect(error.message).to.equal(
                "IdioScalar: name must be of type 'string'"
            );
        }
    });

    it("should throw IdioScalar: creating scalar: 'test' without resolver", () => {
        try {
            const scalar = new IdioScalar({ name: "test" });
        } catch (error) {
            expect(error.message).to.equal(
                "IdioScalar: creating scalar: 'test' without resolver"
            );
        }
    });

    it("should create and return a instance of IdioScalar", () => {
        const scalar = new IdioScalar({ name: "test", resolver: () => true });

        expect(scalar)
            .to.have.property("name")
            .to.equal("test");

        expect(scalar)
            .to.have.property("resolver")
            .to.be.a("function");
    });
});
