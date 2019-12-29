const fs = require("fs");
const { printWithComments } = require("graphql-toolkit");
const { parse } = require("graphql/language");
const IdioError = require("../idio-error.js");

function graphQLLoader(...options) {
    return new Promise((resolve, reject) => {
        fs.readFile(...options, (err, res) => {
            /* istanbul ignore next */
            if (err) {
                return reject(err);
            }

            return resolve(res);
        });
    });
}
/**
 * Returns a promise to resolve typeDefs.
 *
 * @param {any} typeDefs - filePath, gql-tag or string.
 *
 * @returns {Promise<string>} typeDefs - Graphql typeDefs resolver
 */

function parseTypeDefs(typeDefs) {
    if (typeof typeDefs === "string") {
        if (!fs.existsSync(typeDefs)) {
            try {
                parse(typeDefs);

                return async () => typeDefs;
            } catch (error) {
                throw new IdioError(`cannot resolve typeDefs: '${error}'.`);
            }
        } else {
            return async () => graphQLLoader(typeDefs, "utf8");
        }
    } else if (typeof typeDefs === "object") {
        if (Object.keys(typeDefs).includes("kind")) {
            return async () => printWithComments(typeDefs);
        }

        throw new IdioError(
            `cannot resolve typeDefs: ${JSON.stringify(typeDefs, null, 2)}.`
        );
    } else {
        throw new IdioError(`cannot parse typeDefs: ${typeDefs}.`);
    }
}

module.exports = parseTypeDefs;
