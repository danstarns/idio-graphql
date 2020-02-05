const execute = require("./execute.js");

const introspectionCall = require("./introspection-call.js");
const { abort } = require("../../../util/index.js");

/**
 * @typedef {import('../graphql-gateway.js').Runtime} Runtime
 */

/**
 * @param {Runtime} RUNTIME
 */
function createGatewayService(RUNTIME) {
    const { broker } = RUNTIME;

    const [serviceName] = broker.nodeID.split(":");

    const INTROSPECTION_EVENT = `${serviceName}:introspection.request`;

    broker.createService({
        name: broker.options.nodeID,
        actions: {
            abort,
            execute: (...args) => execute(RUNTIME)(...args)
        },
        events: {
            [INTROSPECTION_EVENT]: async ({ type }, service) => {
                await introspectionCall(RUNTIME)(service, type);
            },
            compare: async (introspection, service) => {
                const ABORT_CALL = `${service}.abort`;

                try {
                    Object.entries(introspection.locals).forEach(
                        ([key, values]) => {
                            values.forEach((value) => {
                                if (!RUNTIME.locals[key].includes(value)) {
                                    throw new Error(
                                        `Introspection is missing a local.${key}.${value}`
                                    );
                                }
                            });
                        }
                    );

                    Object.entries(introspection.services).forEach(
                        ([key, values]) => {
                            values.forEach((value) => {
                                if (!RUNTIME.services[key].includes(value)) {
                                    throw new Error(
                                        `Introspection is missing a service .${key}.${value}`
                                    );
                                }
                            });
                        }
                    );
                } catch (error) {
                    await broker.call(ABORT_CALL, {
                        message: `'${introspection.name}' trying to join the network with a different hash to an existing. Error: ${error.message}`
                    });
                }
            }
        }
    });
}

module.exports = createGatewayService;
