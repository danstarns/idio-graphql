const safeJsonStringify = require("safe-json-stringify");
const forEmitOf = require("for-emit-of");

/**
 * @typedef {import('../graphql-node.js').Runtime} Runtime
 * @typedef {import('../graphql-node.js').GraphQLNode} GraphQLNode
 */

/**
 * @param {Runtime & {GraphQLNode: GraphQLNode}} RUNTIME
 * @returns {(introspection: any) => GraphQLNode}
 */
module.exports = (RUNTIME) => {
    return function createLocalNode(introspection) {
        const instanceServiceManager =
            RUNTIME.serviceManagers.node[introspection.name];

        return new RUNTIME.GraphQLNode({
            ...introspection,
            resolvers: Object.entries(introspection.resolvers).reduce(
                (result, [type, methods]) => ({
                    ...result,
                    [type]: methods.reduce((res, resolver) => {
                        async function operation(...graphQLArgs) {
                            const serviceToCall = await instanceServiceManager.getNextService();

                            if (!serviceToCall) {
                                throw new Error(
                                    `No service with name: '${introspection.name}' online.`
                                );
                            }

                            try {
                                const executionResult = await RUNTIME.broker.call(
                                    `${serviceToCall}:${type}.${resolver}`,
                                    {
                                        graphQLArgs: safeJsonStringify(
                                            graphQLArgs
                                        )
                                    }
                                );

                                return executionResult;
                            } catch ({ message }) {
                                throw new Error(
                                    `Execution on service: '${introspection.name}' failed. Error: ${message}`
                                );
                            }
                        }

                        if (type === "Subscription") {
                            return {
                                ...res,
                                [resolver]: {
                                    subscribe: async (...graphQLArgs) =>
                                        forEmitOf(
                                            await operation(...graphQLArgs),
                                            {
                                                transform: (buff) =>
                                                    JSON.parse(buff.toString())
                                            }
                                        )
                                }
                            };
                        }

                        return {
                            ...res,
                            [resolver]: operation
                        };
                    }, {})
                }),
                {}
            )
        });
    };
};
