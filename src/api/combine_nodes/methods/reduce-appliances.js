const { loadAppliances } = require("../../appliances/methods/index.js");
const APPLIANCE_METADATA = require("../../../constants/appliance-metadata");

/**
 * @typedef result
 * @property {string[]} typeDefs
 * @property {object} resolvers
 * @property {object} schemaDirectives
 */

/**
 * @param {import('../combine-nodes.js').appliances} appliances
 */

function reduceAppliances(_appliances) {
    return Object.entries(_appliances).reduce(
        (/** @type {result} */ result, [key, appliances]) => {
            if (!appliances.length && key !== "schemaGlobals") {
                return result;
            }

            const metadata = APPLIANCE_METADATA.find((x) => x.name === key);

            if (!metadata) {
                return result;
            }

            const { typeDefs, resolvers = {} } = loadAppliances(
                appliances,
                metadata
            );

            result.typeDefs.push(typeDefs);

            if (metadata.name === "directives") {
                return {
                    ...result,
                    schemaDirectives: {
                        ...result.schemaDirectives,
                        ...resolvers
                    }
                };
            }

            return {
                ...result,
                resolvers: {
                    ...result.resolvers,
                    ...resolvers
                }
            };
        },
        { resolvers: {}, typeDefs: [], schemaDirectives: {} }
    );
}

module.exports = reduceAppliances;