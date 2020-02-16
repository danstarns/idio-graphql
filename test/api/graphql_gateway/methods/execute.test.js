const { expect } = require("chai");
const proxyquire = require("proxyquire");

describe("execute", () => {
    it("Should catch error and return execution result with errors", async () => {
        const RUNTIME = { schema: { test: true } };

        const execute = proxyquire(
            "../../../../src/api/graphql_gateway/methods/execute.js",
            {
                graphql: {
                    graphql: async ({ schema: _schema }) => {
                        if (!_schema) {
                            throw new Error("schema missing ");
                        }

                        if (!(typeof _schema === "object")) {
                            throw new Error("schema not object");
                        }

                        if (!_schema.test) {
                            throw new Error("schema invalid");
                        }

                        throw new Error("testing");
                    }
                }
            }
        )(RUNTIME);

        const result = await execute({ params: {} });

        expect(result)
            .to.be.a("object")
            .to.have.property("errors")
            .to.be.a("array")
            .lengthOf(1);

        const [err] = result.errors;

        expect(err.message).to.contain("testing");
    });

    it("Should catch error and return execution result with errors", async () => {
        const RUNTIME = { schema: { test: true } };

        const execute = proxyquire(
            "../../../../src/api/graphql_gateway/methods/execute.js",
            {
                graphql: {
                    graphql: async ({ schema: _schema }) => {
                        if (!_schema) {
                            throw new Error("schema missing ");
                        }

                        if (!(typeof _schema === "object")) {
                            throw new Error("schema not object");
                        }

                        if (!_schema.test) {
                            throw new Error("schema invalid");
                        }

                        return { errors: [new Error("testing")], data: null };
                    }
                }
            }
        )(RUNTIME);

        const result = await execute({ params: {} });

        expect(result)
            .to.be.a("object")
            .to.have.property("errors")
            .to.be.a("array")
            .lengthOf(1);

        const [err] = result.errors;

        expect(err.message).to.contain("testing");
    });

    it("Should return execution result", async () => {
        const RUNTIME = { schema: { test: true } };

        const execute = proxyquire(
            "../../../../src/api/graphql_gateway/methods/execute.js",
            {
                graphql: {
                    graphql: async ({ schema: _schema }) => {
                        if (!_schema) {
                            throw new Error("schema missing ");
                        }

                        if (!(typeof _schema === "object")) {
                            throw new Error("schema not object");
                        }

                        if (!_schema.test) {
                            throw new Error("schema invalid");
                        }

                        return { data: { test: true } };
                    }
                }
            }
        )(RUNTIME);

        const result = await execute({ params: {} });

        expect(result)
            .to.be.a("object")
            .to.have.property("data")
            .to.be.a("object")
            .to.have.property("test")
            .to.equal(true);
    });
});
