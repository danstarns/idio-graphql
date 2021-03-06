const fs = require("fs");
const { parse, print } = require("graphql/language");

/**
 *
 * @param {(FilePath | string | GraphQLAST)} typeDefs - filePath, gql-tag or string.
 *
 * @returns {string} typeDefs - Graphql typeDefs resolver
 */
function parseTypeDefs(typeDefs) {
    if (typeof typeDefs === "string") {
        if (!fs.existsSync(typeDefs)) {
            try {
                parse(typeDefs);

                return typeDefs;
            } catch (error) {
                throw new Error(`cannot resolve typeDefs: '${error}'.`);
            }
        } else {
            return fs.readFileSync(typeDefs, "utf8");
        }
    } else if (typeof typeDefs === "object") {
        if (Object.keys(typeDefs).includes("kind")) {
            return print(typeDefs);
        }

        throw new Error(
            `cannot resolve typeDefs: ${JSON.stringify(typeDefs, null, 2)}.`
        );
    } else {
        throw new Error(`cannot parse typeDefs: ${typeDefs}.`);
    }
}

module.exports = parseTypeDefs;
