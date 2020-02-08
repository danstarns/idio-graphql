/* eslint-disable no-multi-assign */
const { loadAppliances } = require("../../appliances/methods/index.js");
const APPLIANCE_METADATA = require("../../../constants/appliance-metadata.js");

function loadNodeAppliances(node) {
    const { enums, interfaces, unions } = node;

    return Object.entries({
        enums,
        interfaces,
        unions
    })
        .filter(([, value]) => Boolean(value))
        .reduce(
            (result, [key, appliances]) => {
                const metadata = APPLIANCE_METADATA.find(
                    ({ name }) => name === key
                );

                const { typeDefs, resolvers } = loadAppliances(
                    appliances,
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
}

module.exports = loadNodeAppliances;
