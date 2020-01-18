const RESTRICTED_NAMES = require("../../constants/restricted-names.js");
const IdioError = require("../idio-error.js");
const { parseTypeDefs } = require("../../util/index.js");
const serveAppliance = require("./methods/serve-appliance.js");

/**
 * @typedef {Object} IdioUnion
 * @property {string} name - The Union name.
 * @property {Promise<string>} typeDefs - Graphql typeDefs resolver.
 * @property {{__resolveType: () => string}} resolver - The Union resolver.
 */

/**
 * Creates a instance of IdioUnion. You can use IdioUnion to modularize a union ( UnionTypeDefinition ),
 * together with its resolver. You can specify unions 'top-level' at combineNodes or at GraphQLNode level.
 *
 * @param {Object} config
 * @param {string} config.name - The Union name.
 * @param {any} config.typeDefs - The Union typeDefs.
 * @param {{__resolveType: () => string}} config.resolver - The Union resolver.
 *
 * @returns IdioUnion
 */
function IdioUnion({ name, resolver, typeDefs } = {}) {
    const prefix = "constructing IdioUnion";

    this.name;
    this.resolver;
    this.typeDefs;

    if (!name) {
        throw new IdioError(`${prefix} name required.`);
    }

    if (typeof name !== "string") {
        throw new IdioError(`${prefix} name must be of type 'string'.`);
    }

    if (RESTRICTED_NAMES[name.toLowerCase()]) {
        throw new IdioError(`${prefix}: '${name}' with invalid name.`);
    }

    this.name = name;

    try {
        this.typeDefs = parseTypeDefs(typeDefs);
    } catch (error) {
        throw new IdioError(`${prefix}: '${name}' \n${error}.`);
    }

    if (!resolver) {
        throw new IdioError(`${prefix}: '${name}' without resolver.`);
    }

    if (!resolver.__resolveType) {
        throw new IdioError(
            `${prefix}: '${name}'.resolver must a __resolveType property.`
        );
    }

    this.resolver = resolver;
}

IdioUnion.prototype.serve = serveAppliance({ type: "IdioUnion" });

module.exports = IdioUnion;
