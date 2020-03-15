/* eslint-disable prettier/prettier */
const { loadNode } = require("../../graphql_node/methods/index.js");
const { runtimeInjection } = require("../../../util/index.js");

/**
 * @typedef {import('../../graphql_node/graphql-node.js').GraphQLNode} GraphQLNode
 */

/**
 *  @typedef ReducedNodes
 *  @property {string[]} typeDefs
 *  @property {object} resolvers
 */

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
                                ...runtimeInjection(methods, RUNTIME)
                            }
                        }
                        : { [key]: runtimeInjection(methods, RUNTIME) })
                }),
                {}
            ),
        ...(node.resolvers.Fields
            ? { [node.name]: runtimeInjection(node.resolvers.Fields, RUNTIME) }
            : {})
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
