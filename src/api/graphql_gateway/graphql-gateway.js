const { createConfig, start } = require("./methods/index.js");
const { createBroker } = require("../../util/index.js");

/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').BrokerOptions} BrokerOptions
 * @typedef {import('../graphql_node/graphql-node.js').GraphQLNode} GraphQLNode
 * @typedef {import('../appliances/idio-enum.js').IdioEnum} IdioEnum
 * @typedef {import('../appliances/idio-scalar.js').IdioScalar} IdioScalar
 * @typedef {import('../appliances/idio-directive.js').IdioDirective} IdioDirective
 * @typedef {import('../appliances/idio-interface.js').IdioInterface} IdioInterface
 * @typedef {import('../appliances/idio-union.js').IdioUnion} IdioUnion
 * @typedef {import('./methods/start.js').Runtime} Runtime
 */

/**
 * @typedef services
 * @property {string[]} nodes
 * @property {string[]} enums
 * @property {string[]} interfaces
 * @property {string[]} unions
 */

/**
 * @typedef locals
 * @property {GraphQLNode[]} nodes
 * @property {IdioEnum[]} enums
 * @property {IdioScalar[]} scalars
 * @property {IdioDirective[]} directives
 * @property {IdioInterface[]} interfaces
 * @property {IdioUnion[]} unions
 * @property {any} schemaGlobals - an Array or a single instance of GraphQL typeDefs, use filePath, string, or gql-tag.
 */

/**
 * @typedef {Object} config
 * @property {services} services
 * @property {locals} locals
 */

/**
 *
 * You can use GraphQLGateway to orchestrate a collection of GraphQLNode's & Schema Appliances exposed over a network.
 *
 * @param {config} config
 * @param {BrokerOptions} brokerOptions
 *
 * @returns {{start: () => Promise<Runtime>, broker: ServiceBroker}}
 */
function GraphQLGateway(config, brokerOptions) {
    const broker = createBroker(
        { name: brokerOptions.nodeID },
        { brokerOptions: { ...brokerOptions, gateway: brokerOptions.nodeID } }
    );

    return {
        broker,
        start: start({
            config: createConfig(config),
            broker
        })
    };
}

module.exports = GraphQLGateway;
