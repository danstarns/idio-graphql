const { parseTypeDefs, validateTypeDefs } = require(`../../util/index.js`);
const RESTRICTED_NAMES = require("../../constants/restricted-names.js");
const IdioError = require("../idio-error.js");

/**
 * @typedef {import('graphql-tools').SchemaDirectiveVisitor} SchemaDirectiveVisitor
 * @typedef {import('graphql').DocumentNode} DocumentNode
 */

/**
 * @typedef IdioDirective
 * @property {string} name
 * @property {string} typeDefs
 * @property {object} resolver
 */

/**
 * You can use IdioDirective to modularize a DirectiveDefinition, together with its resolver.
 *
 * You can only specify directives 'top-level' at combineNodes.
 *
 * @param {object} config
 * @param {string} config.name
 * @param {(string|DocumentNode)} config.typeDefs - gql-tag, string or filePath.
 * @param {SchemaDirectiveVisitor} config.resolver
 *
 * @returns {IdioDirective}
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

    this.typeDefs = validateTypeDefs(this, {
        _Constructor: IdioDirective,
        kind: "DirectiveDefinition",
        singular: "directive",
        name: "directives"
    });

    if (!resolver) {
        throw new IdioError(`${prefix}: '${name}' without a resolver.`);
    }

    this.resolver = resolver;
}

module.exports = IdioDirective;
