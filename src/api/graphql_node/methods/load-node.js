const APPLIANCE_METADATA = require("../../../constants/appliance-metadata.js");
const { loadAppliances } = require("../../appliances/methods/index.js");

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
    const appliances = Object.entries({
        enums: node.enums,
        interfaces: node.interfaces,
        unions: node.unions
    })
        .filter(([, value]) => Boolean(value))
        .reduce(
            (result, [key, _appliances]) => {
                const metadata = APPLIANCE_METADATA.find(
                    ({ name }) => name === key
                );

                const { typeDefs, resolvers } = loadAppliances(
                    _appliances,
                    metadata
                );

                result.typeDefs += `\n${typeDefs}\n`;

                return {
                    ...result,
                    resolvers: {
                        ...result.resolvers,
                        ...resolvers
                    }
                };
            },
            { typeDefs: "", resolvers: {} }
        );

    node.typeDefs = `${node.typeDefs} \n ${appliances.typeDefs}`;

    node.resolvers = {
        ...node.resolvers,
        ...appliances.resolvers
    };

    return node;
}

module.exports = loadNode;
