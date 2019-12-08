const fs = require("fs");
const caller = require("caller");
const path = require("path");

/**
 * @typedef {Object} IdioEnum
 * @property {string} name - The Enum name.
 * @property {string} typeDefs - Path to the Enum.gql file.
 * @property {Object} resolver - The Enum resolver
 */

/**
 * Creates a instance of a IdioEnum.
 *
 * @param {Object} config - An object.
 * @param {string} config.name - The Enum name.
 * @param {string} config.typeDefs - Path to the Enum.gql file.
 * @param {Object} config.resolver - The Enum resolver.
 *
 * @returns IdioEnum
 */
function IdioEnum({ name, typeDefs, resolver } = {}) {
    if (!name) {
        throw new Error("IdioEnum: name required");
    }

    if (typeof name !== "string") {
        throw new Error("IdioEnum: name must be of type 'string'");
    }

    if (!typeDefs) {
        throw new Error(`IdioEnum: creating Enum: '${name}' typeDefs required`);
    }

    if (typeof typeDefs !== "string") {
        throw new Error(
            `IdioEnum: creating Enum: '${name}' typeDefs must be of type 'string'`
        );
    }

    if (!resolver) {
        throw new Error(
            `IdioEnum: creating Enum: '${name}' without a resolver`
        );
    }

    if (!fs.existsSync(typeDefs)) {
        typeDefs = path.normalize(path.join(path.dirname(caller()), typeDefs));

        if (!fs.existsSync(typeDefs)) {
            throw new Error(
                `IdioEnum: typeDefs path '${typeDefs}' does not exist`
            );
        }
    }

    this.name = name;
    this.typeDefs = typeDefs;
    this.resolver = resolver;
}

module.exports = IdioEnum;
