/**
 * @typedef {Object} IdioScalar
 * @property {string} name - The Scalar name.
 * @property {Object} resolver - The Scalar resolver.
 */

/**
 * Creates a instance of a IdioScalar.
 *
 * @param {Object} config - An object.
 * @param {string} config.name - The Scalar name.
 * @param {Object} config.resolver - The Scalar resolver.
 *
 * @returns IdioScalar
 */
function IdioScalar({ name, resolver } = {}) {
    if (!name) {
        throw new Error("IdioScalar: name required");
    }

    if (typeof name !== "string") {
        throw new Error("IdioScalar: name must be of type 'string'");
    }

    if (!resolver) {
        throw new Error(
            `IdioScalar: creating scalar: '${name}' without resolver`
        );
    }

    this.name = name;
    this.resolver = resolver;
}

module.exports = IdioScalar;
