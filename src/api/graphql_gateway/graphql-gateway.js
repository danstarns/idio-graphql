const {
    validateAppliances,
    createGatewayBroker,
    start: startExport
} = require("./methods/index.js");

/**
 * @typedef {import('./methods/validate-appliances.js').appliances} appliances
 * @typedef {import('./methods/start.js').Schema} Schema
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').BrokerOptions} BrokerOptions
 */

/**
 * @typedef {Object} GraphQLGateway
 * @property {() => Schema} start - starts the server
 * @property {ServiceBroker} broker - https://moleculer.services/docs.
 */

/**
 *
 * @param {appliances} appliances
 * @param {BrokerOptions} brokerOptions
 *
 * @returns {GraphQLGateway}
 */
function GraphQLGateway(appliances, brokerOptions) {
    const broker = createGatewayBroker(brokerOptions);

    /**
     * @typedef {() => Schema} startMethod
     */
    const startMethod = startExport({
        appliances: validateAppliances(appliances),
        broker
    });

    return {
        broker,
        start: startMethod
    };
}

module.exports = GraphQLGateway;
