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
                                throw new Error("Request timed out");
                            }

                            const executionResult = await RUNTIME.broker.call(
                                `${serviceToCall}:${type}.${resolver}`,
                                {
                                    graphQLArgs: safeJsonStringify(graphQLArgs)
                                }
                            );

                            return executionResult;
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
