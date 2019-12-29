const { parseTypeDefs } = require(`./util/index.js`);
const RESTRICTED_NAMES = require("./constants/restricted-names.js");
const IdioError = require("./idio-error.js");

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
 * @param {string} config.typeDefs - Graphql typeDefs, use filePath, string, or gql-tag.
 * @param {Object} config.resolver - The Directive resolver.
 *
 * @returns IdioDirective
 */
function IdioDirective({ name, typeDefs, resolver } = {}) {
    const prefix = `constructing IdioDirective`;

    this.name;
    this.typeDefs;
    this.resolver;

    if (!name) {
        throw new IdioError(`${prefix} name required.`);
    }

    if (typeof name !== `string`) {
        throw new IdioError(`${prefix} name must be of type 'string'.`);
    }

    if (RESTRICTED_NAMES[name.toLowerCase()]) {
        throw new IdioError(`${prefix}: '${name}' with invalid name.`);
    }

    this.name = name;

    if (!typeDefs) {
        throw new IdioError(`${prefix}: '${name}' typeDefs required.`);
    }

    try {
        this.typeDefs = parseTypeDefs(typeDefs);
    } catch (error) {
        throw new IdioError(`${prefix}: '${name}' \n${error}.`);
    }

    if (!resolver) {
        throw new IdioError(`${prefix}: '${name}' without a resolver.`);
    }

    this.resolver = resolver;
}

module.exports = IdioDirective;
