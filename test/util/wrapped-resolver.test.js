/* eslint-disable import/no-dynamic-require */
const { expect } = require("chai");

const wrappedResolver = require("../../src/util/wrapped-resolver.js");

describe("wrappedResolver", () => {
    it("should throw resolver required", async () => {
        try {
            await wrappedResolver();

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain("resolver required");
        }
    });

    it("should throw resolver should be of type function", async () => {
        try {
            await wrappedResolver({});

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "resolver must be of type 'Function'."
            );
        }
    });

    it("should throw name required", async () => {
        try {
            await wrappedResolver(() => true, {});

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain("name required.");
        }
    });

    it("should throw name must be of type 'String'.", async () => {
        try {
            await wrappedResolver(() => true, { name: [] });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain("name must be of type 'String'.");
        }
    });

    it("should throw pre must be of type Function|Array<Function>", async () => {
        try {
            await wrappedResolver(() => 1, { name: "test", pre: {} });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "'test.pre' must be of type Function|Array<Function>"
            );
        }
    });

    it("should throw post must be of type Function|Array<Function>", async () => {
        try {
            await wrappedResolver(() => 1, { name: "test", post: {} });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "'test.post' must be of type Function|Array<Function>"
            );
        }
    });

    it("should throw pre[0] must be of type 'Function'", async () => {
        try {
            await wrappedResolver(() => 1, { name: "test", pre: [{}] });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "'test.pre[0]' must be of type 'Function'"
            );
        }
    });

    it("should throw post[0] must be of type 'Function'", async () => {
        try {
            await wrappedResolver(() => 1, { name: "test", post: [{}] });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "'test.post[0]' must be of type 'Function'"
            );
        }
    });

    it("should throw 'test.pre' failed", async () => {
        try {
            const wrapped = wrappedResolver(() => 1, {
                name: "test",
                pre: () => {
                    throw new Error("fail");
                }
            });

            await wrapped(undefined, {}, {}, undefined);

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "'test.pre' failed: \n Error: fail"
            );
        }
    });

    it("should throw 'test.post' failed", async () => {
        try {
            const wrapped = wrappedResolver(() => 1, {
                name: "test",
                post: () => {
                    throw new Error("fail");
                }
            });

            await wrapped(undefined, {}, {}, undefined);

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "'test.post' failed: \n Error: fail"
            );
        }
    });

    it("should throw 'test.pre[0]' failed", async () => {
        try {
            const wrapped = wrappedResolver(() => 1, {
                name: "test",
                pre: [
                    () => {
                        throw new Error("fail");
                    }
                ]
            });

            await wrapped(undefined, {}, {}, undefined);

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "'test.pre[0]' failed: \n Error: fail"
            );
        }
    });

    it("should throw 'test.post[0]' failed", async () => {
        try {
            const wrapped = wrappedResolver(() => 1, {
                name: "test",
                post: [
                    () => {
                        throw new Error("fail");
                    }
                ]
            });

            await wrapped(undefined, {}, {}, undefined);

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "'test.post[0]' failed: \n Error: fail"
            );
        }
    });

    it("should inject into the CONTEXT_INDEX from a pre hook", async () => {
        let result;
        const injections = { abc: "123" };

        const wrapped = wrappedResolver(() => 1, {
            name: "test",
            injections,
            pre: [
                (root, args, context) => {
                    result = context.injections;
                }
            ]
        });

        await wrapped();

        expect(result).to.equal(injections);
    });

    it("should inject into the CONTEXT_INDEX from resolve", async () => {
        let result;
        const injections = { abc: "123" };

        const wrapped = wrappedResolver(
            (root, args, context) => {
                result = context.injections;
            },
            {
                name: "test",
                injections
            }
        );

        await wrapped();

        expect(result).to.equal(injections);
    });

    it("should inject into the CONTEXT_INDEX from post", async () => {
        let result;
        const injections = { abc: "123" };

        const wrapped = wrappedResolver(() => 1, {
            name: "test",
            injections,
            post: [
                (resolved, root, args, context) => {
                    result = context.injections;
                }
            ]
        });

        await wrapped();

        expect(result).to.equal(injections);
    });

    it("should provide the result into the post hooks", async () => {
        let result;

        const wrapped = wrappedResolver(() => "TESTTING", {
            name: "test",
            post: [
                (resolved) => {
                    result = resolved;
                }
            ]
        });

        await wrapped();

        expect(result).to.equal("TESTTING");
    });

    it("should share context between hooks", async () => {
        let result;

        const wrapped = wrappedResolver(
            (_, __, context) => {
                context.word += "T";
            },
            {
                pre: [
                    (_, __, context) => {
                        context.word += "E";
                    },
                    (_, __, context) => {
                        context.word += "S";
                    }
                ],
                name: "test",
                post: [
                    (_, __, ___, context) => {
                        context.word += "I";
                    },
                    (_, __, ___, context) => {
                        context.word += "N";
                    },
                    (_, __, ___, context) => {
                        context.word += "G";

                        result = context.word;
                    }
                ]
            }
        );

        await wrapped(undefined, {}, { word: "T" });

        expect(result).to.equal("TESTING");
    });
});
