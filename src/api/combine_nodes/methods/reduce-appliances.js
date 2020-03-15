const loadAppliances = require("../../appliances/methods/load-appliances.js");
const APPLIANCE_METADATA = require("../../../constants/appliance-metadata");
const { runtimeInjection } = require("../../../util/index.js");

/**
 * @typedef result
 * @property {string[]} typeDefs
 * @property {object} resolvers
 * @property {object} schemaDirectives
 */

/** @typedef {import('../combine-nodes.js').appliances} appliances */

/**
 * @param {import('../combine-nodes.js').appliances} _appliances
 */
function reduceAppliances(_appliances, RUNTIME) {
    return Object.entries(_appliances).reduce(
        (/** @type {result} */ result, [key, appliances]) => {
            if (!appliances.length && key !== "schemaGlobals") {
                return result;
            }

            const metadata = APPLIANCE_METADATA.find((x) => x.name === key);

            if (!metadata) {
                return result;
            }

            let { typeDefs, resolvers = {} } = loadAppliances(
                appliances,
                metadata
            );

            if (key === "types") {
                resolvers = Object.entries(resolvers).reduce(
                    (res, [name, methods]) => ({
                        ...res,
                        [name]: runtimeInjection(methods, RUNTIME)
                    }),
                    {}
                );
            }

            result.typeDefs = [...result.typeDefs, typeDefs].filter(Boolean);

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
