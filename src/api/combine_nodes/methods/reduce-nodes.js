const { loadNode } = require("../../graphql_node/methods/index.js");

/**
 * @typedef {import('../../graphql_node/graphql-node.js').GraphQLNode} GraphQLNode
 * @typedef {GraphQLNode[]} nodes
 */

/**
 *  @typedef reducedNodes
 *  @property {string[]} typeDefs
 *  @property {object} resolvers
 */

/**
 *
 * @param {reducedNodes} r
 * @param {GraphQLNode} node
 */
function reduceNode(r, node) {
    let { ...result } = r;

    result.typeDefs.push(node.typeDefs);

    result.resolvers = {
        ...result.resolvers,
        ...Object.entries(node.resolvers)
            .filter(([key]) => key !== "Fields")
            .reduce(
                (res, [key, value]) => ({
                    ...res,
                    ...(result.resolvers[key]
                        ? { [key]: { ...result.resolvers[key], ...value } }
                        : { [key]: value })
                }),
                {}
            ),
        ...(node.resolvers.Fields ? { [node.name]: node.resolvers.Fields } : {})
    };

    if (node.nodes) {
        const {
            resolvers: nestedResolvers,
            typeDefs: nestedTypeDefs
        } = node.nodes.map(loadNode).reduce(reduceNode, {
            typeDefs: [],
            resolvers: {}
        });

        result = {
            ...result,
            typeDefs: [...result.typeDefs, ...nestedTypeDefs],
            resolvers: Object.entries(result.resolvers).reduce(
                (res, [key, value]) => ({
                    ...res,
                    ...(nestedResolvers[key]
                        ? { [key]: { ...nestedResolvers[key], ...value } }
                        : { [key]: value })
                }),
                {}
            )
        };
    }

    return result;
}

/**
 * @param {nodes} nodes
 * @returns {reducedNodes}
 */
function reduceNodes(nodes) {
    return nodes
        .map(loadNode)
        .reduce(reduceNode, { typeDefs: [], resolvers: {} });
}

module.exports = reduceNodes;
