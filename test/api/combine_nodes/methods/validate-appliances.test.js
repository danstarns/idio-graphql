const { expect } = require("chai");
const proxyquire = require("proxyquire");

function IdioScalar({ name }) {
    this.name = name;
}

const APPLIANCE_METADATA = [
    {
        _Constructor: IdioScalar,
        kind: "ScalarTypeDefinition",
        singular: "scalar",
        name: "scalars"
    }
];

const validateAppliances = proxyquire(
    "../../../../src/api/combine_nodes/methods/validate-appliances.js",
    {
        "../../../constants/appliance-metadata.js": APPLIANCE_METADATA
    }
);

describe("validateAppliances", () => {
    it("Should throw expected appliances to be of type object", () => {
        try {
            validateAppliances(1, {});

            throw new Error("");
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("expected appliances to be of type object");
        }
    });

    it("should throw expected scalars to be an array", () => {
        try {
            validateAppliances({ scalars: {} });

            throw new Error("");
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("expected 'scalars' to be an array");
        }
    });

    it("should throw scalar with name Test already registered", () => {
        try {
            const RUNTIME = {
                REGISTERED_NAMES: {
                    Test: 1
                }
            };

            const appliances = {
                scalars: [new IdioScalar({ name: "Test" })]
            };

            validateAppliances(appliances, RUNTIME);
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain(
                    "IdioScalar with a name: 'Test' already registered"
                );
        }
    });

    it("should validate a scalar and add its name to RUNTIME.REGISTERED_NAMES map", () => {
        const RUNTIME = {
            REGISTERED_NAMES: {}
        };

        const appliances = {
            scalars: [new IdioScalar({ name: "Test" })]
        };

        validateAppliances(appliances, RUNTIME);

        expect(RUNTIME.REGISTERED_NAMES).to.have.property("Test");
    });

    it("should load validate a scalar & a schemaGlobal and one the scalars name to RUNTIME.REGISTERED_NAMES map", () => {
        const RUNTIME = {
            REGISTERED_NAMES: {}
        };

        const appliances = {
            scalars: [new IdioScalar({ name: "Test" })],
            schemaGlobals: ""
        };

        validateAppliances(appliances, RUNTIME);

        expect(RUNTIME.REGISTERED_NAMES).to.have.property("Test");
    });
});
