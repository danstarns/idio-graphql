const proxyquire = require("proxyquire");

function introspectionCall(RUNTIME) {
    if (!RUNTIME.broker) {
        throw new Error("no broker");
    }

    if (!RUNTIME.waitingServices) {
        throw new Error("no waitingServices");
    }

    return async (service, singular) => {
        if (!(typeof service === "string")) {
            throw new Error("service not a string");
        }

        if (!(typeof singular === "string")) {
            throw new Error("singular not a string");
        }
    };
}

const checkForServices = proxyquire(
    "../../../../src/api/graphql_gateway/methods/check-for-services.js",
    {
        "./introspection-call.js": introspectionCall
    }
);

describe("checkForServices", () => {
    it("should check for services", async () => {
        const RUNTIME = {
            broker: {
                logger: { info: () => true },
                options: { nodeId: "gateway:gateway:uuid" }
            },
            waitingServices: {
                nodes: ["User"],
                unions: ["Union"]
            }
        };

        const _checkForServices = checkForServices(RUNTIME);

        setTimeout(() => {
            RUNTIME.waitingServices.nodes = [];
            RUNTIME.waitingServices.unions = [];
        });

        await new Promise(_checkForServices);
    });
});
