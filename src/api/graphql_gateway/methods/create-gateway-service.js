const execute = require("./execute.js");

const introspectionCall = require("./introspection-call.js");
const { abort } = require("../../../util/index.js");
const IdioError = require("../../idio-error.js");

/**
 * @param {import('./start.js').Runtime} RUNTIME
 */
function createGatewayService(RUNTIME) {
    const { broker } = RUNTIME;

    const [serviceName, gatewayName] = broker.options.nodeID.split(":");

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
            [`${serviceName}:${gatewayName}.compare`]: async (
                introspection,
                service
            ) => {
                const ABORT_CALL = `${service}.abort`;

                try {
                    if (introspection.locals) {
                        Object.entries(introspection.locals)
                            .filter(
                                ([key]) => key !== "schemaGlobals"
                            ) /* @todo - not the safest check */
                            .forEach(([key, values]) => {
                                values.forEach((value) => {
                                    if (
                                        !RUNTIME.locals[key]
                                            .map((x) => x.name)
                                            .includes(value)
                                    ) {
                                        throw new IdioError(
                                            `gateway contains a invalid local: '${key}.${value}'`
                                        );
                                    }
                                });

                                RUNTIME.locals[key]
                                    .map((x) => x.name)
                                    .forEach((value) => {
                                        if (!values.includes(value)) {
                                            throw new IdioError(
                                                `gateway is missing a local: '${key}.${value}'`
                                            );
                                        }
                                    });
                            });
                    }

                    if (introspection.services) {
                        Object.entries(introspection.services).forEach(
                            ([key, values]) => {
                                values.forEach((value) => {
                                    if (
                                        !RUNTIME.services[key].includes(value)
                                    ) {
                                        throw new IdioError(
                                            `gateway contains a invalid service: '${key}.${value}'`
                                        );
                                    }
                                });

                                RUNTIME.services[key].forEach((value) => {
                                    if (!values.includes(value)) {
                                        throw new IdioError(
                                            `gateway is missing service: '${key}.${value}'`
                                        );
                                    }
                                });
                            }
                        );
                    }
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
