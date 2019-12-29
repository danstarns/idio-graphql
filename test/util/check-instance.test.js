const { expect } = require("chai");

const path = require("path");

const { SOURCE_PATH = "../../src" } = process.env;

// eslint-disable-next-line import/no-dynamic-require
const checkInstance = require(path.join(
    SOURCE_PATH,
    "/util/check-instance.js"
));

function Cat({ type, color, name }) {
    this.type = type;
    this.color = color;
    this.name = name;
}

describe("checkInstance", () => {
    it("should received a cat not a instanceof Cat", () => {
        const fakeCat = { type: "fake", color: "red", name: "bill" };

        try {
            checkInstance({ instance: fakeCat, of: Cat, name: "cat" });
        } catch (error) {
            expect(error.message).to.contain(
                "received a cat not a instance of Cat"
            );
        }
    });

    it("should received a cat a instanceof Cat", () => {
        const realCat = new Cat({ type: "good", color: "beige", name: "izzy" });

        const result = checkInstance({
            instance: realCat,
            of: Cat,
            name: "cat"
        });

        expect(result).to.be.true;
    });
});
