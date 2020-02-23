const { expect } = require("chai");
const serveLocals = require("../../../../src/api/graphql_gateway/methods/serve-locals.js");

describe("serveLocals", () => {
    it("should serve locals", async () => {
        const nodeID = "gateway:gateway:uuid";

        function serve(brokerOptions) {
            if (!brokerOptions) {
                throw new Error("brokerOptions required");
            }

            if (!(typeof brokerOptions === "object")) {
                throw new Error("brokerOptions should be an object");
            }

            if (brokerOptions.nodeID !== "gateway:gateway:uuid") {
                throw new Error("not valid nodeID");
            }

            if (brokerOptions.gateway !== "gateway") {
                throw new Error("gateway invalid");
            }

            return { tested: true };
        }
        const RUNTIME = {
            locals: {
                enums: [{ serve }],
                interfaces: [{ serve }],
                unions: [{ serve }],
                nodes: [{ serve }]
            },
            broker: {
                options: {
                    nodeID
                }
            }
        };

        const result = await serveLocals(RUNTIME);

        expect(result).to.be.a("array");

        result.forEach((res) => {
            expect(res)
                .to.be.a("object")
                .to.have.property("tested")
                .to.equal(true);
        });
    });
});
