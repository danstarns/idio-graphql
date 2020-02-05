/* eslint-disable no-restricted-syntax */
const { resolveAppliance } = require("../../appliances/methods/index.js");
const APPLIANCE_METADATA = require("../../../constants/appliance-metadata.js");
const wrapResolvers = require("./wrap-resolvers.js");
const validateDefinitions = require("./validate-definitions.js");
const { checkInstance } = require("../../util/index.js");

/**
 * @param {GraphQLNode} n
 */
function loadNode(n, { INTERNALS } = { REGISTERED_NAMES: {} }) {
    const node = { ...n };

    checkInstance({
        instance: node,
        of: GraphQLNode,
        name: "node"
    });

    const { nestedTypeDefs, nestedResolvers } = Object.entries({
        enums: node.enums,
        interfaces: node.interfaces,
        unions: node.unions
    })
        .filter(([, value]) => Boolean(value))
        .reduce(
            (result, [key, appliance]) => {
                const metadata = APPLIANCE_METADATA.find(
                    ({ name }) => name === key
                );

                const resolvedAppliance = resolveAppliance(
                    { ...metadata, appliance },
                    INTERNALS
                );

                result.nestedTypeDefs += `\n${resolvedAppliance.typeDefs}\n`;

                return {
                    ...result,
                    nestedResolvers: {
                        ...result.nestedResolvers,
                        [`${metadata.singular}Resolvers`]: resolvedAppliance.resolvers
                    }
                };
            },
            { nestedTypeDefs: "", nestedResolvers: {} }
        );

    if (node.nodes) {
        node.nodes = node.nodes.map((_node) => loadNode(_node, { INTERNALS }));
    }

    return node;
}

module.exports = loadNode;
