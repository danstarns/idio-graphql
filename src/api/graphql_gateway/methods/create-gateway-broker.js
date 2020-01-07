const { ServiceBroker } = require("moleculer");
const IdioError = require("../../idio-error.js");

/**
 * Broker options is passed into moleculer. For more info, see link;
 * https://moleculer.services/docs/0.13/broker.html#Broker-options
 *
 * @typedef {Object} brokerOptions
 * @property {string} transporter
 * @property {string} nodeID
 * @property {string} namespace
 * @property {string} logLevel
 */

/**
 *
 * @param {brokerOptions} brokerOptions
 */
function validateBrokerOptions(brokerOptions) {
    if (!brokerOptions) {
        throw new IdioError("brokerOptions required.");
    }

    if (!(typeof brokerOptions === "object")) {
        throw new IdioError("brokerOptions must be of type object.");
    }

    if (!brokerOptions.transporter) {
        throw new IdioError("brokerOptions.transporter required.");
    }

    if (!brokerOptions.nodeID) {
        throw new IdioError("brokerOptions.nodeID required.");
    }

    return brokerOptions;
}

/**
 *
 * @param {string} brokerType - spa
 * @param {brokerOptions} brokerOptions
 */
function createGatewayBroker(brokerOptions) {
    validateBrokerOptions(brokerOptions);

    return new ServiceBroker(brokerOptions);
}

module.exports = createGatewayBroker;
