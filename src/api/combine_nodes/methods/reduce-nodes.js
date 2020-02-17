/* eslint-disable prettier/prettier */
const { loadNode } = require("../../graphql_node/methods/index.js");
const { execute } = require("../../../util/index.js");
const CONTEXT_INDEX = require("../../../constants/context-index.js");

/**
 * @typedef {import('../../graphql_node/graphql-node.js').GraphQLNode} GraphQLNode
 */

/**
 *  @typedef ReducedNodes
 *  @property {string[]} typeDefs
 *  @property {object} resolvers
 */

function inject(methods, RUNTIME) {
    return Object.entries(methods).reduce((result, [key, method]) => {
        const createArgs = (graphQLArgs) => {
            if (!graphQLArgs[CONTEXT_INDEX]) {
                graphQLArgs[CONTEXT_INDEX] = {};
            }

            if (!graphQLArgs[CONTEXT_INDEX].injections) {
                graphQLArgs[CONTEXT_INDEX].injections = {};
            }

            if (!(typeof graphQLArgs[CONTEXT_INDEX].injections === "object")) {
                graphQLArgs[CONTEXT_INDEX].injections = {};
            }

            graphQLArgs[CONTEXT_INDEX].injections = {
                ...graphQLArgs[CONTEXT_INDEX].injections,
                execute: execute.withSchema(RUNTIME.schema)
            };

            return graphQLArgs;
        };

        return {
            ...result,
            ...(method.subscribe
                ? {
                    [key]: {
                        ...method,
                        subscribe: (...graphQLArgs) =>
                            method.subscribe(...createArgs(graphQLArgs))
                    }
                }
                : {
                    [key]: (...graphQLArgs) =>
                        method(...createArgs(graphQLArgs))
                })
        };
    }, {});
}

/**
 *
 * @param {ReducedNodes} r
 * @param {GraphQLNode} node
 */
function reduceNode(r, node, RUNTIME) {
    let { ...result } = r;

    result.typeDefs.push(node.typeDefs);

    result.resolvers = {
        ...result.resolvers,
        ...Object.entries(node.resolvers)
            .filter(([key]) => key !== "Fields")
            .reduce(
                (res, [key, methods]) => ({
                    ...res,
                    ...(result.resolvers[key]
                        ? {
                            [key]: {
                                ...result.resolvers[key],
                                ...inject(methods, RUNTIME)
                            }
                        }
                        : { [key]: inject(methods, RUNTIME) })
                }),
                {}
            ),
        ...(node.resolvers.Fields ? { [node.name]: inject(node.resolvers.Fields, RUNTIME) } : {})
    };

    if (node.nodes) {
        const {
            resolvers: nestedResolvers,
            typeDefs: nestedTypeDefs
        } = node.nodes
            .map(loadNode)
            .reduce((_result, _node) => reduceNode(_result, _node, RUNTIME), {
                typeDefs: [],
                resolvers: {}
            });

        result = {
            ...result,
            typeDefs: [...result.typeDefs, ...nestedTypeDefs],
            resolvers: Object.entries(nestedResolvers).reduce(
                (res, [key, value]) => ({
                    ...result.resolvers,
                    ...res,
                    ...(result.resolvers[key]
                        ? { [key]: { ...result.resolvers[key], ...value } }
                        : { [key]: value })
                }),
                {}
            )
        };
    }

    return result;
}

/**
 * @param {GraphQLNode[]} nodes
 * @returns {ReducedNodes}
 */
function reduceNodes(nodes, RUNTIME) {
    return nodes
        .map(loadNode)
        .reduce((result, node) => reduceNode(result, node, RUNTIME), {
            typeDefs: [],
            resolvers: {}
        });
}

module.exports = reduceNodes;
