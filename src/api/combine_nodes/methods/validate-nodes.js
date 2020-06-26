const { checkInstance } = require("../../../util/index.js");
const GraphQLNode = require("../../graphql_node/graphql-node.js");

/**
 * @typedef {import('../../graphql_node/graphql-node.js').GraphQLNode} GraphQLNode
 * @typedef {import('../combine-nodes.js').RUNTIME} RUNTIME
 */

/**
 * @param {GraphQLNode[]} nodes
 * @param {RUNTIME} RUNTIME
 */
function validateNodes(nodes, RUNTIME) {
    if (!nodes) {
        throw new Error("nodes required");
    }

    if (!Array.isArray(nodes)) {
        throw new Error(
            `expected nodes to be of type array received '${typeof nodes}'`
        );
    }

    if (!nodes.length) {
        throw new Error("at least 1 node is required");
    }

    nodes.forEach((node) => {
        checkInstance({
            instance: node,
            of: GraphQLNode,
            name: "node"
        });

        if (RUNTIME.REGISTERED_NAMES[node.name]) {
            throw new Error(
                `GraphQLNode with name: '${node.name}' already registered.`
            );
        }

        RUNTIME.REGISTERED_NAMES[node.name] = 1;
    });
}

module.exports = validateNodes;
