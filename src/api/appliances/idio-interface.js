const RESTRICTED_NAMES = require("../../constants/restricted-names.js");
const IdioError = require("../idio-error.js");
const { parseTypeDefs } = require("../../util/index.js");
const serveAppliance = require("./methods/serve-appliance.js");

/**
 * @typedef {Object} IdioInterface
 * @property {string} name - The Interface name.
 * @property {Promise<string>} typeDefs - Graphql typeDefs resolver..
 * @property {{__resolveType: () => string}} resolver - The Interface resolver.
 */

/**
 * Creates a instance of IdioInterface. You can use IdioInterface to modularize a interface ( InterfaceTypeDefinition ),
 * together with its resolver. You can specify interfaces 'top-level' at combineNodes or at GraphQLNode level.
 *
 * @param {Object} config
 * @param {string} config.name - The Interface name.
 * @param {any} config.typeDefs - The Interface typeDefs.
 * @param {{__resolveType: () => string}} config.resolver - The Interface resolver.
 *
 * @returns IdioInterface
 */
function IdioInterface({ name, resolver, typeDefs } = {}) {
    const prefix = "constructing IdioInterface";

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

IdioInterface.prototype.serve = serveAppliance({ type: "IdioInterface" });

module.exports = IdioInterface;
