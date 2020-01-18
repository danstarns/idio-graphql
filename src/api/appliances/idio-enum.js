const { parseTypeDefs } = require("../../util/index.js");
const RESTRICTED_NAMES = require("../../constants/restricted-names.js");
const IdioError = require("../idio-error.js");
const serveAppliance = require("./methods/serve-appliance.js");

/**
 * @typedef {import('moleculer').BrokerOptions} BrokerOptions
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 */

/**
 * @typedef IdioEnum
 * @property {string} name
 * @property {Promise.<string>} typeDefs
 * @property {Object} resolver
 * @property {(brokerOptions: BrokerOptions) => Promise.<ServiceBroker>} serve
 */

/**
 * You can use IdioEnum to modularize an EnumTypeDefinition, together with its resolver.
 * You can specify enums 'top-level' at combineNodes or at an GraphQLNode level.
 *
 * @param {Object} config
 * @param {string} config.name
 * @param {any} config.typeDefs - gql-tag, string or filePath.
 * @param {Object} config.resolver
 *
 * @returns {IdioEnum}
 */
function IdioEnum({ name, typeDefs, resolver } = {}) {
    const prefix = "constructing IdioEnum";

    this.name;
    this.typeDefs;
    this.resolver;

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

IdioEnum.prototype.serve = serveAppliance({ type: "IdioEnum" });

module.exports = IdioEnum;
