/* eslint-disable no-restricted-syntax */
const { expect } = require("chai");

const streamToIterator = require("../../src/util/stream-to-iterator.js");
const iteratorToStream = require("../../src/util/iterator-to-stream.js");

async function* userGenerator() {
    const users = require("../dummy-data/test.json");

    for (let i = 0; i < users.length; i += 1) {
        yield Buffer.from(JSON.stringify(users[i]));
    }
}

describe("stream-to-iterator", () => {
    it("should convert a stream of json into a object", async () => {
        const readStream = iteratorToStream(userGenerator());

        const asyncIterator = streamToIterator(readStream);

        const users = [];

        for await (const user of asyncIterator) {
            users.push(user);
        }

        expect(users)
            .to.be.a("array")
            .lengthOf(10);
    });

    it("should throw and catch an error in the stream", async () => {
        try {
            const readStream = iteratorToStream(userGenerator());

            const asyncIterator = streamToIterator(readStream);

            let chunkIndex = 0;

            for await (const user of asyncIterator) {
                chunkIndex += 1;

                if (chunkIndex === 2) {
                    readStream.emit("error", new Error("failed in testing"));
                }
            }
        } catch (error) {
            expect(error.message)
                .to.be.a("string")
                .to.contain("failed in testing");
        }
    });
});
