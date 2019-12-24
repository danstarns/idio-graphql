const fs = require("fs");

function readFileAsync(...options) {
    return new Promise((resolve, reject) => {
        fs.readFile(...options, (err, res) => {
            if (err) {
                return reject(err);
            }
            return resolve(res);
        });
    });
}
/**
 * A fancy promise based wrapper around fs.readFile.
 *
 * @param {string} filePath - filePath of graphqlfile.
 *
 * @returns string
 */

async function graphQLLoader(filePath) {
    if (!filePath) {
        throw new Error("graphQLLoader: filePath required");
    }

    return readFileAsync(filePath, "utf-8");
}

module.exports = graphQLLoader;
