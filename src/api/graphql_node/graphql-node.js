const { parseTypeDefs } = require("../../util/index.js");
const RESTRICTED_NAMES = require("../../constants/restricted-names.js");
const APPLIANCE_METADATA = require("../../constants/appliance-metadata.js");
const IdioError = require("../idio-error.js");

const serve = require("./methods/serve.js");

/**
 * @typedef {import('../appliances/idio-enum.js')} IdioEnum
 * @typedef {import('../appliances/idio-interface.js')} IdioInterface
 * @typedef {import('../appliances/idio-union.js')} IdioUnion
 *
 * @typedef {import('moleculer').BrokerOptions} BrokerOptions
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 *
 * @typedef {import('../../util/wrapped-resolver.js').PreUnion} PreUnion
 * @typedef {import('../../util/wrapped-resolver.js').PostUnion} PostUnion
 */

/**
 * @typedef ResolverObjectInput
 * @property {Function} resolve
 * @property {PreUnion} pre - Function(s) to call pre the resolve method.
 * @property {PostUnion} post - Function(s) to call post the resolve method.
 */

/**
 * @typedef {(ResolverObjectInput|Function)} ResolverUnion
 */

/**
 * @typedef ResolverType
 * @property {Object.<string, ResolverUnion>} Query
 * @property {Object.<string, ResolverUnion>} Mutation
 * @property {Object.<string, {subscribe: Function}>} Subscription
 * @property {Object.<string, ResolverUnion>} Fields
 */

/**
 * @typedef GraphQLNode
 * @property {string} name
 * @property {Promise<string>} typeDefs
 * @property {ResolverType} resolvers
 * @property {Array.<GraphQLNode>} nodes
 * @property {any} injections
 * @property {Array.<IdioEnum>} enums
 * @property {Array.<IdioInterface>} interfaces
 * @property {Array.<IdioUnion>} unions
 * @property {(brokerOptions: BrokerOptions) => ServiceBroker} serve
 */

/**
 * @typedef GraphQLNodeInput
 * @property {string} name
 * @property {any} typeDefs - gql-tag, string or filePath.
 * @property {ResolverType} resolvers
 * @property {Array.<GraphQLNode>} nodes
 * @property {any} injections
 * @property {Array.<IdioEnum>} enums
 * @property {Array.<IdioInterface>} interfaces
 * @property {Array.<IdioUnion>} unions
 */

/**
 * You can use GraphQLNode to modularize an ObjectTypeDefinition together with its related resolvers & properties.
 *
 * @param {GraphQLNodeInput} config
 *
 * @returns {GraphQLNode}
 */
function GraphQLNode(config) {
    const {
        name,
        typeDefs,
        resolvers,
        nodes,
        injections,
        enums,
        interfaces,
        unions
    } = config;

    const prefix = "constructing GraphQLNode";

    this.name;
    this.typeDefs;
    this.resolvers;
    this.nodes;
    this.injections;

    this.enums;
    this.interfaces;
    this.unions;

    this.serve;

    if (!name) {
        throw new IdioError(`${prefix}: name required.`);
    }

    if (typeof name !== `string`) {
        throw new IdioError(`${prefix}: name must be of type 'string'.`);
    }

    if (RESTRICTED_NAMES[name.toLocaleLowerCase()]) {
        throw new IdioError(
            `${prefix}: creating node '${name}' with invalid name.`
        );
    }

    this.name = name;

    if (!typeDefs) {
        throw new IdioError(`${prefix}: '${name}' typeDefs required.`);
    }

    try {
        this.typeDefs = parseTypeDefs(typeDefs);
    } catch (error) {
        throw new IdioError(`${prefix}: '${name}' Error: '${error}'.`);
    }

    if (!resolvers) {
        throw new IdioError(`${prefix}: '${name}' resolvers required.`);
    }

    const typeOfResolvers = typeof resolvers;

    if (typeOfResolvers !== "object") {
        throw new IdioError(
            `${prefix}: expected node: '${name}' resolvers to be of type 'object' but received '${typeOfResolvers}'.`
        );
    }

    const allowedResolvers = ["Query", "Mutation", "Subscription", "Fields"];

    const notAllowedResolvers = Object.keys(resolvers).filter(
        (key) => !allowedResolvers.includes(key)
    );

    if (notAllowedResolvers.length) {
        throw new IdioError(
            `${prefix}: '${name}' resolvers received unexpected properties '[ ${notAllowedResolvers.join(
                ", "
            )} ]'.`
        );
    }

    if (resolvers.Subscription) {
        Object.entries(resolvers.Subscription).forEach(([key, resolver]) => {
            if (!resolver.subscribe) {
                throw new IdioError(
                    `${prefix}: '${name}' resolvers.Subscription.${key} must contain a subscribe method`
                );
            }
        });
    }

    this.resolvers = resolvers;

    Object.entries({
        enums,
        interfaces,
        unions,
        nodes
    }).forEach(([key, appliances]) => {
        if (appliances) {
            if (!Array.isArray(appliances)) {
                throw new IdioError(
                    `${prefix}: '${name}' ${key} must be of type 'array'.`
                );
            }

            const { plural, applianceConstructor } = APPLIANCE_METADATA.find(
                (x) => x.name === key
            );

            function checkInstanceOfAppliance(appliance) {
                if (!(appliance instanceof applianceConstructor)) {
                    throw new IdioError(
                        `${prefix}: '${name}' expected ${plural} to be instance of '${applianceConstructor.name}'.`
                    );
                }
            }

            appliances.forEach(checkInstanceOfAppliance);

            this[key] = appliances;
        }
    });

    if (injections) {
        this.injections = injections;
    }
}

GraphQLNode.prototype.serve = serve(GraphQLNode);

module.exports = GraphQLNode;
