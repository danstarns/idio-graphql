const { expect } = require("chai");
const compareGateways = require("../../../../src/api/graphql_gateway/methods/compare-gateways.js");

describe("compareGateways", () => {
    const testLocals = { nodes: [{ name: "User" }] };
    const testServices = { nodes: ["Post"] };

    const broker = {
        options: {
            nodeID: "gateway:gateway:uuid"
        },
        emit: (action, { locals, services, name }) => {
            if (!action) {
                throw new Error("no action");
            }

            if (!(typeof action === "string")) {
                throw new Error("action is not a string");
            }

            if (!name) {
                throw new Error("no name");
            }

            if (!(typeof name === "string")) {
                throw new Error("name is not a string");
            }

            if (!name === "gateway") {
                throw new Error("invalid name");
            }

            if (!action === "gateway:gateway.compare") {
                throw new Error("invalid action");
            }

            if (!locals) {
                throw new Error("no locals");
            }

            if (!services) {
                throw new Error("no services");
            }

            return { locals, services };
        }
    };

    it("should compare gateways", () => {
        const comparedGateway = compareGateways({
            broker,
            locals: testLocals,
            services: testServices
        });

        expect(comparedGateway.locals.nodes).to.be.an("array");
        expect(comparedGateway.services).to.eql(testServices);
    });
});
