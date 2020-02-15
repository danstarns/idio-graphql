const { expect } = require("chai");

const ServiceManager = require("../../src/util/services-manager.js");

describe("ServiceManager", () => {
    it("should return a instance of ServiceManager", () => {
        let services = [
            { id: "gateway:gateway:uuid2" },
            { id: "gateway:gateway:uuid3" },
            { id: "gateway:anotherGateway:uuid3" },
            { id: "another:gateway:uuid3" }
        ];

        const broker = {
            call: () => services,
            options: { heartbeatInterval: 1 }
        };

        const manager = new ServiceManager("gateway:gateway:uuid", {
            broker,
            hash: "test"
        });

        expect(manager).to.be.a.instanceOf(ServiceManager);
    });

    it("should push a service into the active services", () => {
        let services = [
            { id: "gateway:gateway:uuid2" },
            { id: "gateway:gateway:uuid3" },
            { id: "gateway:anotherGateway:uuid3" },
            { id: "another:gateway:uuid3" }
        ];

        const broker = {
            call: () => services,
            options: { heartbeatInterval: 1 }
        };

        const manager = new ServiceManager("gateway:gateway:uuid", {
            broker,
            hash: "test"
        });

        expect(manager).to.be.a.instanceOf(ServiceManager);

        manager.push("test:test:uuid");

        expect(manager)
            .to.have.property("activeServices")
            .to.be.a("array");

        expect(manager.activeServices.find((x) => x === "test:test:uuid"))
            .to.be.a("string")
            .to.equal("test:test:uuid");
    });

    it("should return undefined if there is no services in active services", async () => {
        let services = [];

        const broker = {
            call: () => services,
            options: { heartbeatInterval: 1 }
        };

        const manager = new ServiceManager("gateway:gateway:uuid", {
            broker,
            hash: "test"
        });

        expect(manager).to.be.a.instanceOf(ServiceManager);

        manager.activeServices = [];

        const nextService = await manager.getNextService();

        expect(nextService).to.be.undefined;
    });

    it("should get the next service and assign the last output to it ", async () => {
        let services = [];

        const broker = {
            call: () => services,
            options: { heartbeatInterval: 1 }
        };

        const manager = new ServiceManager("gateway:gateway:uuid", {
            broker,
            hash: "test"
        });

        expect(manager).to.be.a.instanceOf(ServiceManager);

        const nextService = await manager.getNextService();

        expect(nextService).to.be.a("string");

        expect(manager)
            .to.have.property("lastOutput")
            .to.be.a("string")
            .to.equal(nextService);
    });

    it("should try not to return the same service waiting a second to allow new services to be discovered", async () => {
        let services = [];

        const broker = {
            call: () => services,
            options: { heartbeatInterval: 5 }
        };

        const manager = new ServiceManager("gateway:gateway:uuid", {
            broker,
            hash: "test"
        });

        expect(manager).to.be.a.instanceOf(ServiceManager);

        manager.lastOutput = manager.activeServices[0];

        const nextService = await manager.getNextService();

        expect(nextService).to.be.a("string");

        expect(manager)
            .to.have.property("lastOutput")
            .to.be.a("string")
            .to.equal(nextService);
    });
});
