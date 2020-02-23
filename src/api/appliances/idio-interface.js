const RESTRICTED_NAMES = require("../../constants/restricted-names.js");
const IdioError = require("../idio-error.js");
const { parseTypeDefs, validateTypeDefs } = require("../../util/index.js");
const serveAppliance = require("./methods/serve-appliance.js");

/**
 * @typedef {import('moleculer').BrokerOptions} BrokerOptions
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('graphql').DocumentNode} DocumentNode
 */

/**
 * @typedef IdioInterface
 * @property {string} name
 * @property {string} typeDefs
 * @property {{__resolveType: () => string}} resolver
 * @property {(brokerOptions: BrokerOptions) => Promise<ServiceBroker>} serve
 */

/**
 * You can use IdioInterface to modularize an InterfaceTypeDefinition, together with its resolver.
 *
 * You can specify interfaces 'top-level' at combineNodes or at an GraphQLNode level.
 *
 * @param {object} config
 * @param {string} config.name
 * @param {(string|DocumentNode)} config.typeDefs - gql-tag, string or filePath.
 * @param {{__resolveType: () => string}} config.resolver
 *
 * @returns {IdioInterface}
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

    this.typeDefs = validateTypeDefs(this, {
        _Constructor: IdioInterface,
        kind: "InterfaceTypeDefinition",
        singular: "interface",
        name: "interfaces"
    });

    if (!resolver) {
        throw new IdioError(`${prefix}: '${name}' without resolver.`);
    }

    if (!resolver.__resolveType) {
        throw new IdioError(
            `${prefix}: '${name}'.resolver must have a __resolveType property.`
        );
    }

    this.resolver = resolver;
}

IdioInterface.prototype.serve = serveAppliance({
    _Constructor: IdioInterface,
    kind: "InterfaceTypeDefinition",
    singular: "interface",
    name: "interfaces"
});

module.exports = IdioInterface;
