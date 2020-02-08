/**
 * @typedef {import('../graphql-gateway.js').Runtime} Runtime
 */

/**
 * @param {Runtime} RUNTIME
 */
function compareGateways(RUNTIME) {
    const { broker, locals, services } = RUNTIME;

    const [serviceName, gatewayName] = broker.nodeID.split(":");

    const COMPARE_ACTION = `${serviceName}:${gatewayName}.compare`;

    return broker.emit(COMPARE_ACTION, {
        locals: Object.entries(locals).reduce((result, [key, values]) => {
            if (values) {
                return {
                    ...result,
                    [key]: values.map(({ name }) => name)
                };
            }

            return result;
        }, {}),
        services
    });
}

module.exports = compareGateways;