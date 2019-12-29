const RESTRICTED_NAMES = require("./constants/restricted-names.js");
const IdioError = require("./idio-error.js");

/**
 * @typedef {Object} IdioScalar
 * @property {string} name - The Scalar name.
 * @property {Promise<string>} typeDefs - Graphql typeDefs resolver..
 * @property {Object} resolver - The Scalar resolver.
 */

/**
 * Creates a instance of IdioScalar.
 *
 * @param {Object} config
 * @param {string} config.name - The Scalar name.
 * @param {Object} config.resolver - The Scalar resolver.
 *
 * @returns IdioScalar
 */
function IdioScalar({ name, resolver } = {}) {
    const prefix = "constructing IdioScalar";

    this.name;
    this.resolver;
    this.typeDefs;

    if (!name) {
        throw new IdioError(`${prefix} name required.`);
    }

    if (typeof name !== "string") {
        throw new IdioError(`${prefix} name must be of type 'string'.`);
    }

    if (RESTRICTED_NAMES[name.toLowerCase()]) {
        throw new IdioError(`${prefix}: '${name}' with invalid name.`);
    }

    this.name = name;

    this.typeDefs = async () => `scalar ${name}`;

    if (!resolver) {
        throw new IdioError(`${prefix}: '${name}' without resolver.`);
    }

    this.resolver = resolver;
}

module.exports = IdioScalar;
