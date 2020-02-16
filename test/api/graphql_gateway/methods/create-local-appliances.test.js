const { expect } = require("chai");
const proxyquire = require("proxyquire");

function createLocalAppliance() {
    return () => ({
        tested: true
    });
}

const RUNTIME = {
    registeredServices: {
        unions: [{ tested: true }],
        nodes: [{ tested: true }]
    },
    broker: {},
    serviceManagers: {},
    locals: { scalars: [{ tested: true }] }
};

const createLocalAppliances = proxyquire(
    "../../../../src/api/graphql_gateway/methods/create-local-appliances.js",
    {
        "../../appliances/methods/index.js": { createLocalAppliance }
    }
);

describe("createLocalAppliances", () => {
    it("should create local appliances", () => {
        const result = createLocalAppliances(RUNTIME);

        expect(result).to.be.a("object");

        const { scalars, unions } = result;

        expect(scalars).to.be.a("array");

        expect(unions).to.be.a("array");

        expect(scalars[0])
            .to.be.a("object")
            .to.have.property("tested")
            .to.equal(true);

        expect(unions[0])
            .to.be.a("object")
            .to.have.property("tested")
            .to.equal(true);
    });
});
