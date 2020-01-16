const IdioError = require("../../idio-error.js");

const { streamToIterator } = require("../../../util/index.js");

/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('../graphql-node.js').GraphQLNode} GraphQLNode
 */

/**
 *
 * @param {Object} options
 * @param {ServiceBroker} options.broker
 * @param {GraphQLNode} options.GraphQLNode
 */
function createLocalNode({ broker, GraphQLNode }) {
    return (introspection) => {
        return new GraphQLNode({
            ...introspection,
            resolvers: Object.entries(introspection.resolvers).reduce(
                (result, [type, methods]) => ({
                    ...result,
                    [type]: methods.reduce((res, resolver) => {
                        async function localResolver(...graphQLArgs) {
                            try {
                                const response = await broker.call(
                                    `${introspection.name}:${type}.${resolver}`,
                                    { graphQLArgs }
                                );

                                return response;
                            } catch (error) {
                                throw new IdioError(
                                    `Can't communicate with service: '${introspection.name}, Error:\n${error}'`
                                );
                            }
                        }

                        if (type === "Subscription") {
                            return {
                                ...res,
                                [resolver]: {
                                    async subscribe(...graphQLArgs) {
                                        try {
                                            const response = await broker.call(
                                                `${introspection.name}:${type}.${resolver}`,
                                                { graphQLArgs }
                                            );

                                            return streamToIterator(response);
                                        } catch (error) {
                                            throw new IdioError(
                                                `Can't communicate with service: '${introspection.name}, Error:\n${error}'`
                                            );
                                        }
                                    }
                                }
                            };
                        }

                        return {
                            ...res,
                            [resolver]: localResolver
                        };
                    }, {})
                }),
                {}
            )
        });
    };
}

module.exports = createLocalNode;
