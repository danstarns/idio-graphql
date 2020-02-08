const { checkInstance } = require("../../../util/index.js");
const IdioError = require("../../idio-error.js");
const GraphQLNode = require("../../graphql_node/graphql-node.js");

/**
 * @typedef {import('../combine-nodes.js').GraphQLNode} GraphQLNode
 * @typedef {GraphQLNode[]} nodes
 */

/**
 * @param {nodes} nodes
 */
function validateNodes(nodes, RUNTIME) {
    if (!nodes) {
        throw new IdioError("nodes required");
    }

    if (!Array.isArray(nodes)) {
        throw new IdioError(
            `expected nodes to be of type array received '${typeof nodes}'`
        );
    }

    nodes.forEach((node) => {
        checkInstance({
            instance: node,
            of: GraphQLNode,
            name: "node"
        });

        if (RUNTIME.REGISTERED_NAMES[node.name]) {
            throw new IdioError(
                `GraphQLNode with name: '${node.name}' already registered.`
            );
        }

        RUNTIME.REGISTERED_NAMES[node.name] = 1;
    });
}

module.exports = validateNodes;
