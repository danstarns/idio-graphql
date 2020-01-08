const IdioError = require("../../idio-error.js");

/**
 * @typedef {import('../../graphql-node.js')} GraphQLNode
 * @typedef {import('../../idio-scalar.js')} IdioScalar
 * @typedef {import('../../idio-enum.js')} IdioEnum
 * @typedef {import('../../idio-directive.js')} IdioDirective
 */

/**
 * @typedef {Object} appliances
 * @property {Array.<string>} dependencies
 * @property {Array.<IdioScalar>} scalars
 * @property {Array.<GraphQLNode>} nodes
 * @property {Array.<IdioEnum>} enums
 * @property {Array.<IdioDirective>} directives
 * @property {any} schemaGlobals - an Array or a single instance of Graphql typeDefs, use filePath, string, or gql-tag.
 */

/**
 *
 * @param {appliances} appliances
 */
function validateAppliances(appliances) {
    if (!appliances) {
        throw new IdioError("appliances required.");
    }

    if (!(typeof appliances === "object")) {
        throw new IdioError("appliances must be of type object.");
    }

    if (!appliances.dependencies) {
        throw new IdioError("appliances.dependencies required.");
    }

    if (!Array.isArray(appliances.dependencies)) {
        throw new IdioError(
            "appliances.dependencies must be of type Array.<string>."
        );
    }

    if (!appliances.dependencies.length) {
        throw new IdioError("you must have 1 or more appliances.dependencies.");
    }

    appliances.dependencies.forEach((dependency) => {
        if (!(typeof dependency === "string")) {
            throw new IdioError(
                "appliances.dependencies must be of type Array.<string>."
            );
        }
    });

    appliances.dependencies = [...new Set([...appliances.dependencies])];

    return appliances;
}

module.exports = validateAppliances;
