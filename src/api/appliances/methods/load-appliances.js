const { mergeTypeDefs, printWithComments } = require("@graphql-tools/merge");
const { parseTypeDefs } = require("../../../util/index.js");

/**
 * @param {import('../index.js').appliances} appliances
 * @returns {{typeDefs: string, resolvers: object}}
 */
function loadAppliances(appliances, metadata) {
    const { name } = metadata;

    if (name === "schemaGlobals") {
        if (Array.isArray(appliances)) {
            if (!appliances.length) {
                return {};
            }

            return {
                typeDefs: printWithComments(
                    mergeTypeDefs(appliances.map(parseTypeDefs))
                )
            };
        }

        return {
            typeDefs: parseTypeDefs(appliances)
        };
    }

    if (!Array.isArray(appliances)) {
        throw new Error(`expected '${name}' to be an array.`);
    }

    const { typeDefs, resolvers } = appliances.reduce(
        (result, appliance) => ({
            typeDefs: [...result.typeDefs, appliance.typeDefs],
            resolvers: {
                ...result.resolvers,
                [appliance.name]:
                    name === "types" ? appliance.resolvers : appliance.resolver
            }
        }),
        { typeDefs: [], resolvers: {} }
    );

    return { typeDefs: printWithComments(mergeTypeDefs(typeDefs)), resolvers };
}

module.exports = loadAppliances;
