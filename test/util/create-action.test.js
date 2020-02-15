const { expect } = require("chai");
const proxyquire = require("proxyquire");
const INDEX = require("../../src/constants/context-index.js");

function execute(...args) {
    const context = args[INDEX];

    if (!context.injections) {
        throw new Error("context.injections should be an object");
    }

    if (!context.injections.broker) {
        throw new Error("context.injections.broker missing");
    }

    if (!context.injections.execute) {
        throw new Error("context.injections.execute missing");
    }

    return "test";
}

function iteratorToStream(func) {
    return func;
}

const createAction = proxyquire("../../src/util/create-action.js", {
    execute,
    "./iterator-to-stream.js": iteratorToStream
});

describe("createAction", () => {
    it("should return create injections and inject broker and execute", async () => {
        function method(...args) {
            const context = args[INDEX];

            if (!context.injections) {
                throw new Error("context.injections should be an object");
            }

            if (!context.injections.broker) {
                throw new Error("context.injections.broker missing");
            }

            if (!context.injections.execute) {
                throw new Error("context.injections.execute missing");
            }

            return "test";
        }

        const action = createAction(
            { method, contextIndex: INDEX },
            { broker: { test: true } }
        );

        const result = await action({});

        expect(result)
            .to.be.a("string")
            .to.equal("test");
    });

    it("should return create injections and inject broker and execute with subscribe method", async () => {
        function method(...args) {
            const context = args[INDEX];

            if (!context.injections) {
                throw new Error("context.injections should be an object");
            }

            if (!context.injections.broker) {
                throw new Error("context.injections.broker missing");
            }

            if (!context.injections.execute) {
                throw new Error("context.injections.execute missing");
            }

            return "test";
        }

        const action = createAction(
            { method: { subscribe: method }, contextIndex: INDEX },
            { broker: { test: true } }
        );

        const result = await action({ params: {} });

        expect(result)
            .to.be.a("string")
            .to.equal("test");
    });

    it("should inject inject and preserve existing injections", async () => {
        function method(...args) {
            const context = args[INDEX];

            if (!context.injections) {
                throw new Error("context.injections should be an object");
            }

            if (!context.injections.broker) {
                throw new Error("context.injections.broker missing");
            }

            if (!context.injections.execute) {
                throw new Error("context.injections.execute missing");
            }

            if (!context.injections.test) {
                throw new Error("context.injections.test missing");
            }

            return "test";
        }

        const action = createAction(
            { method: { subscribe: method }, contextIndex: INDEX },
            { broker: { test: true } }
        );

        const graphQLArgs = [];

        graphQLArgs[INDEX] = {
            injections: {
                test: true
            }
        };

        const result = await action({
            params: { graphQLArgs: JSON.stringify(graphQLArgs) }
        });

        expect(result)
            .to.be.a("string")
            .to.equal("test");
    });
});
