const { expect } = require("chai");
const proxyquire = require("proxyquire");

function uuid() {
    return "testing";
}

const moleculer = {
    ServiceBroker: function ServiceBroker(options) {
        this.options = options;
    }
};

const createBroker = proxyquire("../../src/util/create-broker.js", {
    uuid: {
        v4: uuid
    },
    moleculer
});

describe("createBroker", () => {
    it("should throw instance.name required", () => {
        try {
            createBroker({}, { brokerOptions: { transporter: "test" } });
        } catch (error) {
            expect(error.message)
                .to.be.a("string")
                .to.contain("instance.name required");
        }
    });

    it("should throw brokerOptions required", () => {
        try {
            createBroker({ name: "test" }, {});
        } catch (error) {
            expect(error.message)
                .to.be.a("string")
                .to.contain("brokerOptions required");
        }
    });

    it("should throw brokerOptions.transporter required", () => {
        try {
            createBroker({ name: "test" }, { brokerOptions: {} });
        } catch (error) {
            expect(error.message)
                .to.be.a("string")
                .to.contain("brokerOptions.transporter required");
        }
    });

    it("should throw brokerOptions.gateway required", () => {
        try {
            createBroker(
                { name: "test" },
                { brokerOptions: { transporter: "test" } }
            );
        } catch (error) {
            expect(error.message)
                .to.be.a("string")
                .to.contain("brokerOptions.gateway required");
        }
    });

    it("should return a broker", () => {
        const broker = createBroker(
            { name: "test" },
            { brokerOptions: { transporter: "test", gateway: "gateway" } }
        );

        expect(broker).to.be.a.instanceOf(moleculer.ServiceBroker);

        expect(broker.options)
            .to.have.property("nodeID")
            .to.be.a("string")
            .to.equal("test:gateway:testing");

        expect(broker.options)
            .to.have.property("transporter")
            .to.be.a("string")
            .to.equal("test");

        expect(broker.options)
            .to.have.property("gateway")
            .to.be.a("string")
            .to.equal("gateway");
    });
});
