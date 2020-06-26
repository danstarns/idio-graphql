const RESTRICTED_NAMES = require("../../constants/restricted-names.js");
const { parseTypeDefs, validateTypeDefs } = require("../../util/index.js");
const serveAppliance = require("./methods/serve-appliance.js");

/**
 * @typedef {import('moleculer').BrokerOptions} BrokerOptions
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('graphql').DocumentNode} DocumentNode
 */

/**
 * @typedef IdioUnion
 * @property {string} name
 * @property {string} typeDefs
 * @property {{__resolveType: () => string}} resolver
 * @property {(brokerOptions: BrokerOptions) => Promise.<ServiceBroker>} serve
 */

/**
 * You can use IdioUnion to modularize a UnionTypeDefinition, together with its resolver.
 * You can specify unions 'top-level' at combineNodes or at an GraphQLNode level.
 *
 * @param {object} config
 * @param {string} config.name
 * @param {(string|DocumentNode)} config.typeDefs - gql-tag, string or filePath.
 * @param {{__resolveType: () => string}} config.resolver
 *
 * @returns {IdioUnion}
 */
function IdioUnion({ name, resolver, typeDefs } = {}) {
    const prefix = "constructing IdioUnion";

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

    try {
        this.typeDefs = parseTypeDefs(typeDefs);
    } catch (error) {
        throw new Error(`${prefix}: '${name}' \n${error}.`);
    }

    this.typeDefs = validateTypeDefs(this, {
        _Constructor: IdioUnion,
        kind: "UnionTypeDefinition",
        singular: "union",
        name: "unions"
    });

    if (!resolver) {
        throw new Error(`${prefix}: '${name}' without resolver.`);
    }

    if (!resolver.__resolveType) {
        throw new Error(
            `${prefix}: '${name}'.resolver must have a __resolveType property.`
        );
    }

    this.resolver = resolver;
}

IdioUnion.prototype.serve = serveAppliance({
    _Constructor: IdioUnion,
    kind: "UnionTypeDefinition",
    singular: "union",
    name: "unions"
});

module.exports = IdioUnion;
