const { RESTRICTED_NAMES } = require("./constants/index.js");

/**
 * @typedef {Object} IdioScalar
 * @property {string} name - The Scalar name.
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
    this.name;
    this.resolver;

    if (!name) {
        throw new Error("IdioScalar: name required");
    }

    if (typeof name !== "string") {
        throw new Error("IdioScalar: name must be of type 'string'");
    }

    if (RESTRICTED_NAMES[name.toLowerCase()]) {
        throw new Error(
            `IdioScalar: creating scalar: '${name}' with invalid name`
        );
    }

    this.name = name;

    if (!resolver) {
        throw new Error(
            `IdioScalar: creating scalar: '${name}' without resolver`
        );
    }

    this.resolver = resolver;
}

module.exports = IdioScalar;
