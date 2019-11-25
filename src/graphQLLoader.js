const {
    promises: fs,
    constants: { R_OK }
} = require("fs");

/**
 * A fancy promise based wrapper around fs.readFile.
 *
 * @param {string} filePath - filePath of graphqlfile.
 *
 * @returns String
 */

async function graphQLLoader(filePath) {
    if (!filePath) {
        throw new Error("graphQLLoader: filePath required");
    }

    await fs.access(filePath, R_OK);

    return fs.readFile(filePath, "utf-8");
}

module.exports = graphQLLoader;
