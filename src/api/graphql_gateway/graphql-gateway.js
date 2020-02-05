const {
    createConfig,
    createGatewayBroker,
    start
} = require("./methods/index.js");

/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').BrokerOptions} BrokerOptions
 * @typedef {import('graphql').GraphQLSchema} GraphQLSchema
 * @typedef {import('../graphql_node/graphql-node.js').GraphQLNode} GraphQLNode
 * @typedef {import('../appliances/idio-enum.js').IdioEnum} IdioEnum
 * @typedef {import('../appliances/idio-scalar.js').IdioScalar} IdioScalar
 * @typedef {import('../appliances/idio-directive.js').IdioDirective} IdioDirective
 * @typedef {import('../appliances/idio-interface.js').IdioInterface} IdioInterface
 * @typedef {import('../appliances/idio-union.js').IdioUnion} IdioUnion
 * @typedef {import('../../util/services-manager.js').ServiceManager} ServiceManager
 */

/**
 * @typedef services
 * @property {Array.<string>} nodes
 * @property {Array.<string>} enums
 * @property {Array.<string>} interfaces
 * @property {Array.<string>} unions
 */

/**
 * @typedef locals
 * @property {Array.<GraphQLNode>} nodes
 * @property {Array.<IdioEnum>} enums
 * @property {Array.<IdioScalar>} scalars
 * @property {Array.<IdioDirective>} directives
 * @property {Array.<IdioInterface>} interfaces
 * @property {Array.<IdioUnion>} unions
 * @property {any} schemaGlobals - an Array or a single instance of GraphQL typeDefs, use filePath, string, or gql-tag.
 */

/**
 * @typedef {Object} config
 * @property {services} services
 * @property {locals} locals
 */

/**
 * @typedef Runtime
 * @property {locals} locals
 * @property {services} services
 * @property {services} registeredServices
 * @property {services} waitingServices
 * @property {Object.<string, ServiceManager>} serviceManagers
 * @property {string} typeDefs
 * @property {Object} resolvers
 * @property {Object} resolvers.Query
 * @property {Object} resolvers.Mutation
 * @property {Object} resolvers.Subscription
 * @property {Object} schemaDirectives
 * @property {ServiceBroker} broker
 * @property {GraphQLSchema} schema
 */

/**
 * @typedef {Object} GraphQLGateway
 * @property {() => Promise.<Runtime>} start
 * @property {ServiceBroker} broker
 */

/**
 *
 * You can use GraphQLGateway to orchestrate a collection of GraphQLNode's & Schema Appliances exposed over a network.
 *
 * @param {config} config
 * @param {BrokerOptions} brokerOptions
 *
 * @returns {GraphQLGateway}
 */
function GraphQLGateway(config, brokerOptions) {
    const broker = createGatewayBroker(brokerOptions);

    return {
        broker,
        start: start({
            config: createConfig(config),
            broker
        })
    };
}

module.exports = GraphQLGateway;
