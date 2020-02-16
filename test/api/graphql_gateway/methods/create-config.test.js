const { expect } = require("chai");
const proxyquire = require("proxyquire");

function checkInstance() {
    return true;
}

const createConfig = proxyquire(
    "../../../../src/api/graphql_gateway/methods/create-config.js",
    {
        "../../../util/index.js": { checkInstance }
    }
);

describe("createConfig", () => {
    it("should throw config required", () => {
        try {
            createConfig();

            throw new Error("");
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("config required");
        }
    });

    it("should throw config must be of type object", () => {
        try {
            createConfig(1);

            throw new Error("");
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("config must be of type object");
        }
    });

    it("should throw services must be of type object", () => {
        try {
            createConfig({ services: 1 });

            throw new Error("");
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("services must be of type object");
        }
    });

    it("should throw services.directives not supported", () => {
        try {
            createConfig({ services: { directives: [] } });

            throw new Error("");
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("services.directives not supported");
        }
    });

    it("should throw services.scalars not supported", () => {
        try {
            createConfig({ services: { scalars: [] } });

            throw new Error("");
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("services.scalars not supported");
        }
    });

    it("should throw services.interfaces must be of type array", () => {
        try {
            createConfig({ services: { interfaces: {} } });

            throw new Error("");
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("services.interfaces must be of type array");
        }
    });

    it("should throw services.interfaces[0] must be of type string", () => {
        try {
            createConfig({ services: { interfaces: [{}] } });

            throw new Error("");
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("services.interfaces[0] must be of type string");
        }
    });

    it("should throw locals must be of type object", () => {
        try {
            createConfig({ locals: 1 });

            throw new Error("");
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("locals must be of type object");
        }
    });

    it("should throw locals.interfaces must be of type array", () => {
        try {
            createConfig({ locals: { interfaces: {} } });

            throw new Error("");
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain("locals.interfaces must be of type array");
        }
    });

    it("should create and return config", () => {
        const config = {
            locals: { nodes: [{}] },
            services: { nodes: ["User"] }
        };

        const newConfig = createConfig(config);

        expect(newConfig)
            .to.be.a("object")
            .to.have.property("locals")
            .to.be.a("object");

        expect(newConfig.locals)
            .to.have.property("nodes")
            .to.be.a("array");

        expect(newConfig.locals)
            .to.have.property("enums")
            .to.be.a("array");

        expect(newConfig.locals)
            .to.have.property("interfaces")
            .to.be.a("array");

        expect(newConfig.locals)
            .to.have.property("unions")
            .to.be.a("array");

        expect(newConfig.locals)
            .to.have.property("directives")
            .to.be.a("array");

        expect(newConfig.locals)
            .to.have.property("scalars")
            .to.be.a("array");

        expect(newConfig.locals)
            .to.have.property("schemaGlobals")
            .to.be.a("string");

        expect(newConfig)
            .to.be.a("object")
            .to.have.property("services")
            .to.be.a("object");

        expect(newConfig.services)
            .to.have.property("nodes")
            .to.be.a("array");

        expect(newConfig.services)
            .to.have.property("enums")
            .to.be.a("array");

        expect(newConfig.services)
            .to.have.property("interfaces")
            .to.be.a("array");

        expect(newConfig.services)
            .to.have.property("unions")
            .to.be.a("array");
    });

    it("should throw no declared nodes", () => {
        try {
            createConfig({});

            throw new Error();
        } catch ({ message }) {
            expect(message)
                .to.be.a("string")
                .to.contain(
                    "no declared nodes, provide a list of local or remote nodes"
                );
        }
    });
});
