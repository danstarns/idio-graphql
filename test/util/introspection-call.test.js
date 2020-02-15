const { expect } = require("chai");
const introspectionCall = require("../../src/util/introspection-call.js");

describe("introspectionCall", () => {
    it("should preform introspection", async () => {
        try {
            let counter = 0;

            const RUNTIME = {
                brokerOptions: {
                    gateway: "gateway"
                },
                broker: {},
                initialized: false
            };

            function emit() {
                counter += 1;

                if (counter < 2) {
                    throw new Error();
                }

                RUNTIME.initialized = true;
            }

            RUNTIME.broker.emit = emit;

            await new Promise(introspectionCall(RUNTIME, { type: "node" }));

            expect(RUNTIME.initialized).to.equal(true);
        } catch (error) {
            console.error(error);
            throw error;
        }
    });
});
