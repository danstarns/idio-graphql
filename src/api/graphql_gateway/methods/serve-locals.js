/**
 * @typedef {import('../graphql-gateway.js').Runtime} Runtime
 */

/**
 * @param {Runtime} RUNTIME
 */
function serveLocals(RUNTIME) {
    const { locals, broker } = RUNTIME;

    return Promise.all(
        Object.entries(locals)
            .filter(
                ([name]) =>
                    !["scalars", "directives", "schemaGlobals"].includes(name)
            )
            .flatMap(([, value]) => value)
            .map((local) => {
                const [gateway] = broker.options.nodeID.split(":");

                return local.serve({
                    ...broker.options,
                    gateway
                });
            })
    );
}

module.exports = serveLocals;
