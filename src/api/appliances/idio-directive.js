const { parseTypeDefs, validateTypeDefs } = require(`../../util/index.js`);
const { SchemaDirectiveVisitor } = require("graphql-tools");
const RESTRICTED_NAMES = require("../../constants/restricted-names.js");
const IdioError = require("../idio-error.js");

/**
 * @typedef {import('graphql-tools').SchemaDirectiveVisitor} SchemaDirectiveVisitor
 */

/**
 * @typedef IdioDirective
 * @property {string} name
 * @property {Promise<string>} typeDefs
 * @property {Object} resolver
 */

/**
 * You can use IdioDirective to modularize an DirectiveDefinition, together with its resolver.
 *
 * You can only specify directives 'top-level' at combineNodes.
 *
 * @param {Object} config
 * @param {string} config.name
 * @param {any} config.typeDefs - gql-tag, string or filePath.
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

    if (
        !Object.prototype.isPrototypeOf.call(
            SchemaDirectiveVisitor.prototype,
            resolver
        ) &&
        !Object.prototype.isPrototypeOf.call(SchemaDirectiveVisitor, resolver)
    ) {
        throw new IdioError(
            `${prefix}: '${name}'.resolver must be a instance of SchemaDirectiveVisitor.`
        );
    }

    this.resolver = resolver;
}

module.exports = IdioDirective;
