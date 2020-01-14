const {
    createConfig,
    createGatewayBroker,
    start
} = require("./methods/index.js");

/**
 * @typedef {import('./methods/create-config.js').config} config
 * @typedef {import('./methods/start.js').Schema} Schema
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').BrokerOptions} BrokerOptions
 */

/**
 * @typedef {Object} GraphQLGateway
 * @property {() => Schema} start - starts the server.
 * @property {ServiceBroker} broker - https://moleculer.services/docs.
 */

/**
 *
 * You can use GraphQLGateway to build a distributed schema via multiple means of transport.
 *
 * @param {config} config
 * @param {BrokerOptions} brokerOptions
 *
 * @returns {GraphQLGateway}
 */
function GraphQLGateway(config, brokerOptions) {
    const broker = createGatewayBroker(brokerOptions);

    /**
     * @property {() => Schema} start
     */
    return {
        broker,
        start: start({
            brokerOptions,
            config: createConfig(config),
            broker
        })
    };
}

module.exports = GraphQLGateway;
