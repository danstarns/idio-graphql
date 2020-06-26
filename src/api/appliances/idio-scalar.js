const RESTRICTED_NAMES = require("../../constants/restricted-names.js");

/**
 * @typedef {import('graphql').GraphQLScalarType} GraphQLScalarType
 */

/**
 * @typedef IdioScalar
 * @property {string} name
 * @property {GraphQLScalarType} resolver
 */

/**
 * You can use IdioScalar to modularize a ( ScalarTypeDefinition ), together with its resolver.
 *
 * You can only specify scalars 'top-level' at combineNodes.
 *
 * IdioScalar does not require typeDefs, it uses the name to match up the resolver.
 *
 * @param {object} config
 * @param {string} config.name
 * @param {GraphQLScalarType} config.resolver
 *
 * @returns {IdioScalar}
 */
function IdioScalar({ name, resolver } = {}) {
    const prefix = "constructing IdioScalar";

    this.name;
    this.resolver;
    this.typeDefs;

    if (!name) {
        throw new Error(`${prefix} name required.`);
    }

    if (typeof name !== "string") {
        throw new Error(`${prefix} name must be of type 'string'.`);
    }

    if (RESTRICTED_NAMES[name.toLowerCase()]) {
        throw new Error(`${prefix}: '${name}' with invalid name.`);
    }

    this.name = name;

    this.typeDefs = `scalar ${name}`;

    if (!resolver) {
        throw new Error(`${prefix}: '${name}' without resolver.`);
    }

    this.resolver = resolver;
}

module.exports = IdioScalar;
