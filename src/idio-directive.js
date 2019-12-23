const { parseTypeDefs } = require("./util/index.js");

/**
 * @typedef {Object} IdioDirective
 * @property {string} name - The Directive name.
 * @property {Promise<string>} typeDefs - Graphql typeDefs resolver.
 * @property {Object} resolver - The Directive resolver.
 */

/**
 * Creates a instance of a IdioDirective.
 *
 * @param {Object} config
 * @param {string} config.name - The Directive name.
 * @param {string} config.typeDefs - Graphql typedefs, use filePath, string, or gql-tag.
 * @param {Object} config.resolver - The Directive resolver.
 *
 * @returns IdioDirective
 */
function IdioDirective({ name, typeDefs, resolver } = {}) {
    this.name;
    this.typeDefs;
    this.resolver;

    if (!name) {
        throw new Error("IdioDirective: name required");
    }

    if (typeof name !== "string") {
        throw new Error("IdioDirective: name must be of type 'string'");
    }

    this.name = name;

    if (!typeDefs) {
        throw new Error(
            `IdioDirective: creating Directive: '${name}' typeDefs required`
        );
    }

    try {
        this.typeDefs = parseTypeDefs(typeDefs);
    } catch (error) {
        throw new Error(
            `IdioDirective: creating Directive: '${name}' Error: ${error}`
        );
    }

    if (!resolver) {
        throw new Error(
            `IdioDirective: creating Directive: '${name}' without a resolver`
        );
    }

    this.resolver = resolver;
}

module.exports = IdioDirective;
