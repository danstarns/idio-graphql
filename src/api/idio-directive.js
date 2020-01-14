const { parseTypeDefs } = require(`../util/index.js`);
const { SchemaDirectiveVisitor } = require("graphql-tools");
const RESTRICTED_NAMES = require("../constants/restricted-names.js");
const IdioError = require("./idio-error.js");

/**
 * @typedef {import('graphql-tools').SchemaDirectiveVisitor} SchemaDirectiveVisitor
 */

/**
 * @typedef {Object} IdioDirective
 * @property {string} name - The Directive name.
 * @property {Promise<string>} typeDefs - Graphql typeDefs resolver.
 * @property {Object} resolver - The Directive resolver.
 */

/**
 * Creates a instance of a IdioDirective. You can use IdioDirective to modularize a directive ( DirectiveDefinition ),
 * together with its resolver. You can only apply directives 'top-level' at combineNodes.
 *
 * @param {Object} config
 * @param {string} config.name - The Directive name.
 * @param {any} config.typeDefs - Graphql typeDefs, use filePath, string, or gql-tag.
 * @param {SchemaDirectiveVisitor} config.resolver - The Directive resolver.
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
