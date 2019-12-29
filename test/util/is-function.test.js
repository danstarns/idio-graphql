const { expect } = require("chai");
const isFunction = require("../../src/util/is-function.js");

describe("isFunction", () => {
    it("should return that is is a function", () => {
        const result = isFunction(isFunction);

        expect(result).to.be.true;
    });

    it("should return that is is a function", () => {
        const result = isFunction(() => true);

        expect(result).to.be.true;
    });

    it("should return that is is a function", () => {
        const result = isFunction(function () {
            return true;
        });

        expect(result).to.be.true;
    });

    it("should return that is is a function", () => {
        const result = isFunction(async function () {
            return true;
        });

        expect(result).to.be.true;
    });

    it("should return that is is not a function", () => {
        const result = isFunction({});

        expect(result).to.be.false;
    });

    it("should return that is is not a function", () => {
        const result = isFunction([]);

        expect(result).to.be.false;
    });

    it("should return that is is not a function", () => {
        const result = isFunction("function");

        expect(result).to.be.false;
    });

    it("should return that is is not a function", () => {
        const result = isFunction(1);

        expect(result).to.be.false;
    });

    it("should return false for undefined", () => {
        const result = isFunction(undefined);

        expect(Boolean(result)).to.be.false;
    });

    it("should return false for undefined", () => {
        const result = isFunction();

        expect(Boolean(result)).to.be.false;
    });
});
