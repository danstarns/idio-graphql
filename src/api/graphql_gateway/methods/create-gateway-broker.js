const { ServiceBroker } = require("moleculer");
const IdioError = require("../../idio-error.js");

/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').BrokerOptions} BrokerOptions
 */

/**
 *
 * @param {BrokerOptions} brokerOptions
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
 * @param {BrokerOptions} brokerOptions
 * @returns ServiceBroker
 */
function createGatewayBroker(brokerOptions) {
    validateBrokerOptions(brokerOptions);

    return new ServiceBroker(brokerOptions);
}

module.exports = createGatewayBroker;
