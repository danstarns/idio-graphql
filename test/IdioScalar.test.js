/* eslint-disable no-unused-vars */
const { expect } = require("chai");
const path = require("path");
const IdioScalar = require("../src/IdioScalar.js");

describe("IdioScalar", () => {
    it("should throw name required", (done) => {
        try {
            const scalar = new IdioScalar();
        } catch (error) {
            expect(error.message).to.contain("name required");

            done();
        }
    });

    it("should throw name must be a string", (done) => {
        try {
            const scalar = new IdioScalar({ name: [] });
        } catch (error) {
            expect(error.message).to.contain("name must be of type 'string'");

            done();
        }
    });

    it("should throw creating scalar without resolver", (done) => {
        try {
            const scalar = new IdioScalar({ name: "JSON" });
        } catch (error) {
            expect(error.message).to.contain("without resolver");

            done();
        }
    });

    it("should create and return IdioScalar", (done) => {
        const scalar = new IdioScalar({ name: "JSON", resolver: () => true });

        expect(scalar)
            .to.have.property("name")
            .to.be.a("string");

        expect(scalar)
            .to.have.property("resolver")
            .to.be.a("function");

        done();
    });
});
