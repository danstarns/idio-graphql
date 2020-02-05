const { createLocalAppliance } = require("../../appliances/methods/index.js");

/**
 * @typedef {import('../graphql-gateway.js').Runtime} Runtime
 */

/**
 * @param {Runtime} RUNTIME
 */
module.exports = function createLocalAppliances(RUNTIME) {
    const { registeredServices, broker, serviceManagers, locals } = RUNTIME;

    return {
        ...["locals", "directives", "schemaGlobals"].reduce(
            (res, type) => ({ ...res, [type]: locals[type] || [] }),
            {}
        ),
        ...Object.entries(registeredServices)
            .filter(([key]) => key !== "nodes")
            .reduce(
                (result, [key, values]) => ({
                    ...result,
                    [key]: values.map(
                        createLocalAppliance({
                            type: key,
                            broker,
                            serviceManagers
                        })
                    )
                }),
                {}
            )
    };
};
