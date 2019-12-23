const fs = require("fs");
const { printWithComments } = require("graphql-toolkit");
const { parse } = require("graphql/language");
const graphQLLoader = require("./graphql-loader.js");

/**
 * Returns a promise to resolve typeDefs.
 *
 * @param {any} typeDefs - filePath, gql-tag or string.
 *
 * @returns {Promise<string>} typeDefs - Graphql typedefs resolver
 */

function parseTypeDefs(typeDefs) {
    if (typeof typeDefs === "string") {
        if (!fs.existsSync(typeDefs)) {
            try {
                parse(typeDefs);

                return async () => typeDefs;
            } catch (error) {
                throw new Error(
                    `parseTypeDefs: error parsing typeDefs: '${error}'`
                );
            }
        } else {
            return async () => graphQLLoader(typeDefs);
        }
    } else if (typeof typeDefs === "object") {
        if (Object.keys(typeDefs).includes("kind")) {
            return async () => printWithComments(typeDefs);
        }
        throw new Error(
            `parseTypeDefs: cannot resolve typeDefs: ${JSON.stringify(
                typeDefs,
                null,
                2
            )}`
        );
    } else {
        throw new Error(`parseTypeDefs: cannot parse typeDefs: ${typeDefs}`);
    }
}

module.exports = parseTypeDefs;
