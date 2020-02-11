const safeJsonStringify = require("safe-json-stringify");
const IdioError = require("../../idio-error.js");
const { streamToIterator } = require("../../../util/index.js");

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
                        async function operation({ graphQLArgs, stream }) {
                            const serviceToCall = await instanceServiceManager.getNextService();

                            if (!serviceToCall) {
                                throw new IdioError(
                                    `No service with name: '${introspection.name}' online.`
                                );
                            }

                            const call = () => {
                                return RUNTIME.broker.call(
                                    `${serviceToCall}:${type}.${resolver}`,
                                    {
                                        graphQLArgs: safeJsonStringify(
                                            graphQLArgs
                                        )
                                    }
                                );
                            };

                            try {
                                let executionResult;

                                if (stream) {
                                    executionResult = streamToIterator(
                                        await call()
                                    );
                                } else {
                                    executionResult = await call();
                                }

                                return executionResult;
                            } catch ({ message }) {
                                throw new IdioError(
                                    `Execution on service: '${introspection.name}' failed. Error: ${message}`
                                );
                            }
                        }

                        if (type === "Subscription") {
                            return {
                                ...res,
                                [resolver]: {
                                    subscribe: (...graphQLArgs) =>
                                        operation({
                                            graphQLArgs,
                                            stream: true
                                        })
                                }
                            };
                        }

                        return {
                            ...res,
                            [resolver]: (...graphQLArgs) =>
                                operation({ graphQLArgs })
                        };
                    }, {})
                }),
                {}
            )
        });
    };
};
