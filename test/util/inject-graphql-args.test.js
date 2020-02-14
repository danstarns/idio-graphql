const { expect } = require("chai");
const CONTEXT_INDEX = require("../../src/constants/context-index.js");
const injectGraphQLArgs = require("../../src/util/inject-graphql-args.js");

describe("injectGraphQLArgs", () => {
    it("should return the original args if no args.length or injections", () => {
        const arr = ["testing"];

        const result = injectGraphQLArgs({ graphQLArgs: arr });

        expect(result)
            .to.be.a("array")
            .lengthOf(1);

        expect(result[0])
            .to.be.a("string")
            .to.contain("testing");
    });

    it("should throw injections must be an object", () => {
        try {
            const graphQLArgs = Array(10).fill(null);

            graphQLArgs[CONTEXT_INDEX] = { injections: 1 };

            injectGraphQLArgs({ graphQLArgs, injections: 1 });

            throw new Error();
        } catch (error) {
            expect(error.message)
                .to.be.a("string")
                .to.contain("injections must be an object");
        }
    });

    it("should place the injections in the context index position", () => {
        const result = injectGraphQLArgs({
            graphQLArgs: [{}, {}, {}, {}],
            injections: { tested: true }
        });

        expect(result).to.be.an("array");

        const context = result[CONTEXT_INDEX];

        expect(context)
            .to.be.a("object")
            .to.have.property("injections")
            .to.be.a("object")
            .to.have.property("tested")
            .to.be.a("boolean")
            .to.equal(true);
    });

    it("should place the injections in the context index position & preserve any existing", () => {
        const graphQLArgs = Array(10).fill(null);

        graphQLArgs[CONTEXT_INDEX] = {
            injections: {
                preserve: "me"
            }
        };

        const result = injectGraphQLArgs({
            graphQLArgs,
            injections: { tested: true }
        });

        expect(result).to.be.an("array");

        const context = result[CONTEXT_INDEX];

        expect(context)
            .to.be.a("object")
            .to.have.property("injections")
            .to.be.a("object")
            .to.have.property("tested")
            .to.be.a("boolean")
            .to.equal(true);

        expect(context)
            .to.be.a("object")
            .to.have.property("injections")
            .to.be.a("object")
            .to.have.property("preserve")
            .to.be.a("string")
            .to.equal("me");
    });

    it("should make args index a object if dont exist", () => {
        const result = injectGraphQLArgs({
            graphQLArgs: [{}],
            injections: { tested: true }
        });

        expect(result).to.be.an("array");

        const context = result[CONTEXT_INDEX];

        expect(context).to.be.a("object");
    });
});
