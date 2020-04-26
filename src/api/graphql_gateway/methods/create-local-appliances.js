const createLocalAppliance = require("../../appliances/methods/create-local-appliance.js");

/**
 * @param {import('./start.js').Runtime} RUNTIME
 */
module.exports = function createLocalAppliances(RUNTIME) {
    const { registeredServices, broker, serviceManagers, locals } = RUNTIME;

    return {
        ...["scalars", "directives", "schemaGlobals"].reduce(
            (res, type) => ({
                ...res,
                ...(locals[type] ? { [type]: locals[type] } : {})
            }),
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
