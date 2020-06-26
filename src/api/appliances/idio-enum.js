const { parseTypeDefs, validateTypeDefs } = require("../../util/index.js");
const RESTRICTED_NAMES = require("../../constants/restricted-names.js");
const serveAppliance = require("./methods/serve-appliance.js");

/**
 * @typedef {import('moleculer').BrokerOptions} BrokerOptions
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('graphql').DocumentNode} DocumentNode
 */

/**
 * @typedef IdioEnum
 * @property {string} name
 * @property {string} typeDefs
 * @property {object} resolver
 * @property {(brokerOptions: BrokerOptions) => Promise<ServiceBroker>} serve
 */

/**
 * You can use IdioEnum to modularize a EnumTypeDefinition, together with its resolver.
 *
 * You can specify enums 'top-level' at combineNodes or at an GraphQLNode level.
 *
 * @param {Object} config
 * @param {string} config.name
 * @param {(string|DocumentNode)} config.typeDefs - gql-tag, string or filePath.
 * @param {object} config.resolver
 *
 * @returns {IdioEnum}
 */
function IdioEnum({ name, typeDefs, resolver } = {}) {
    const prefix = "constructing IdioEnum";

    this.name;
    this.typeDefs;
    this.resolver;

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

    if (!typeDefs) {
        throw new Error(`${prefix}: '${name}' typeDefs required.`);
    }

    try {
        this.typeDefs = parseTypeDefs(typeDefs);
    } catch (error) {
        throw new Error(`${prefix}: '${name}' \n${error}.`);
    }

    this.typeDefs = validateTypeDefs(this, {
        _Constructor: IdioEnum,
        kind: "EnumTypeDefinition",
        singular: "enum",
        name: "enums"
    });

    if (!resolver) {
        throw new Error(`${prefix}: '${name}' without a resolver.`);
    }

    this.resolver = resolver;
}

IdioEnum.prototype.serve = serveAppliance({
    _Constructor: IdioEnum,
    kind: "EnumTypeDefinition",
    singular: "enum",
    name: "enums"
});

module.exports = IdioEnum;
