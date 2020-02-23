const { expect } = require("chai");
const validateTypeDefs = require("../../src/util/validate-typedefs.js");

describe("validateTypeDefs", () => {
    it("should throw instance with name could not parse typeDefs", () => {
        try {
            const instance = { name: "test", typeDefs: `testing` };
            const metadata = {
                _Constructor: function Test() {
                    this.test = true;
                }
            };

            validateTypeDefs(instance, metadata);

            throw new Error();
        } catch (error) {
            expect(error.message)
                .to.be.a("string")
                .to.contain("Test with name: 'test' could not parse typeDefs");
        }
    });

    it("should throw Test should contain a definition called test", () => {
        try {
            const instance = {
                name: "test",
                typeDefs: `
                type _test {
                    a: String
                }
            `
            };
            const metadata = {
                _Constructor: function Test() {
                    this.test = true;
                },
                kind: "ObjectTypeDefinition"
            };

            validateTypeDefs(instance, metadata);

            throw new Error();
        } catch (error) {
            expect(error.message)
                .to.be.a("string")
                .to.contain(
                    "Test with name: 'test' should contain a ObjectTypeDefinition called 'test'"
                );
        }
    });

    it("should return the typeDefs", () => {
        const instance = {
            name: "test",
            typeDefs: `
            type test {
                a: String
            }
        `
        };
        const metadata = {
            _Constructor: function Test() {
                this.test = true;
            },
            kind: "ObjectTypeDefinition"
        };

        const res = validateTypeDefs(instance, metadata);

        expect(res)
            .to.be.a("string")
            .to.contain("type test");
    });
});
