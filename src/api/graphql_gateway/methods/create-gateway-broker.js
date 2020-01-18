const IdioError = require("../../idio-error.js");

/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').BrokerOptions} BrokerOptions
 */

/**
 *
 * @param {BrokerOptions} brokerOptions
 * @returns {BrokerOptions}
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
 * @returns {ServiceBroker}
 */
function createGatewayBroker(brokerOptions) {
    validateBrokerOptions(brokerOptions);

    let moleculer = {};

    try {
        // eslint-disable-next-line global-require
        moleculer = require("moleculer");
    } catch (error) {
        throw new IdioError(
            `Cant find module: 'moleculer' install using npm install --save moleculer `
        );
    }

    const { ServiceBroker } = moleculer;

    return new ServiceBroker(brokerOptions);
}

module.exports = createGatewayBroker;
