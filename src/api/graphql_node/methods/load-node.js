/* eslint-disable no-multi-assign */
const { resolveAppliances } = require("../../appliances/methods/index.js");
const APPLIANCE_METADATA = require("../../../constants/appliance-metadata.js");

function loadNodeAppliances({ enums, interfaces, unions }, INTERNALS) {
    return Object.entries({
        enums,
        interfaces,
        unions
    })
        .filter(([, value]) => Boolean(value))
        .reduce(
            (result, [key, appliance]) => {
                const metadata = APPLIANCE_METADATA.find(
                    ({ name }) => name === key
                );

                const { typeDefs, resolvers } = resolveAppliances(
                    { ...metadata, appliance },
                    INTERNALS
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
}

/**
 * @param {GraphQLNode} n
 */
function loadNode(n, { INTERNALS } = { REGISTERED_NAMES: {} }) {
    const node = { ...n };

    const appliances = loadNodeAppliances({ ...node });

    if (node.nodes) {
        node.nodes = node.nodes.map((_node) => loadNode(_node, { INTERNALS }));
    }

    node.typeDefs = node.typeDefs += `\n${appliances.typeDefs}\n`;

    node.resolvers = {
        ...node.resolvers,
        ...appliances.resolvers
    };

    return node;
}

module.exports = loadNode;
