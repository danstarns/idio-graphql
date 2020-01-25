const { expect } = require("chai");
const iteratorToStream = require("../../src/util/iterator-to-stream.js");

describe("iterator-to-stream", () => {
    it("should throw iterator must be of type async iterator", () => {
        try {
            iteratorToStream("abc");
        } catch (error) {
            expect(error.message).to.contain(
                "iterator must be a 'async iterator'"
            );
        }
    });
});
