const fs = require("fs");
const caller = require("caller");
const path = require("path");

/**
 * @typedef {Object} IdioDirective
 * @property {string} name - The Directive name.
 * @property {string} typeDefs - Path to the Directive.gql file.
 * @property {Object} resolver - The Directive resolver
 */

/**
 * Creates a instance of a IdioDirective.
 *
 * @param {Object} config - An object.
 * @param {string} config.name - The Directive name.
 * @param {string} config.typeDefs - Path to the Directive.gql file.
 * @param {Object} config.resolver - The Directive resolver.
 *
 * @returns IdioDirective
 */
function IdioDirective({ name, typeDefs, resolver } = {}) {
    if (!name) {
        throw new Error("IdioDirective: name required");
    }

    if (typeof name !== "string") {
        throw new Error("IdioDirective: name must be of type 'string'");
    }

    if (!typeDefs) {
        throw new Error(
            `IdioDirective: creating Directive: '${name}' typeDefs required`
        );
    }

    if (typeof typeDefs !== "string") {
        throw new Error(
            `IdioDirective: creating Directive: '${name}' typeDefs must be of type 'string'`
        );
    }

    if (!resolver) {
        throw new Error(
            `IdioDirective: creating Directive: '${name}' without a resolver`
        );
    }

    if (!fs.existsSync(typeDefs)) {
        typeDefs = path.normalize(path.join(path.dirname(caller()), typeDefs));

        if (!fs.existsSync(typeDefs)) {
            throw new Error(
                `IdioDirective: typeDefs path '${typeDefs}' does not exist`
            );
        }
    }

    this.name = name;
    this.typeDefs = typeDefs;
    this.resolver = resolver;
}

module.exports = IdioDirective;
