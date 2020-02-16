/**
 * @typedef {import('./start.js').Runtime} Runtime
 */

/**
 * @param {Runtime} RUNTIME
 */
function compareGateways(RUNTIME) {
    const { broker, locals, services } = RUNTIME;

    const [serviceName, gatewayName] = broker.options.nodeID.split(":");

    const COMPARE_ACTION = `${serviceName}:${gatewayName}.compare`;

    return broker.emit(COMPARE_ACTION, {
        locals: Object.entries(locals).reduce(
            (result, [key, values]) => ({
                ...result,
                [key]: values.map(({ name }) => name)
            }),
            {}
        ),
        services
    });
}

module.exports = compareGateways;
