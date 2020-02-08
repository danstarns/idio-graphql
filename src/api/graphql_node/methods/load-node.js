const loadNodeAppliances = require("./load-node-appliances.js");

/**
 * @typedef {import('../graphql-node.js').GraphQLNode} GraphQLNode
 * @typedef {import('../../appliances/index.js').IdioEnum} IdioEnum
 * @typedef {import('../../appliances/index.js').IdioInterface} IdioInterface
 * @typedef {import('../../appliances/index.js').IdioUnion} IdioUnion
 */

/**
 * @typedef appliances
 * @property {IdioEnum[]} enums
 * @property {IdioInterface[]} interfaces
 * @property {IdioUnion[]} unions
 */

/**
 * @param {GraphQLNode} node
 */
function loadNode(node) {
    /** @type {appliances} */
    const appliances = loadNodeAppliances({ ...node });

    node.typeDefs = `${node.typeDefs} \n ${appliances.typeDefs}`;

    node.resolvers = {
        ...node.resolvers,
        ...appliances.resolvers
    };

    return node;
}

module.exports = loadNode;
