/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
const uuid = require("uuid/v4");
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
        moleculer = require("moleculer");
    } catch (error) {
        throw new IdioError(
            `Cant find module: 'moleculer' install using npm install --save moleculer `
        );
    }

    const { nodeID } = brokerOptions;

    const serviceUUID = `${nodeID}:${nodeID}:${uuid()}`;

    return new moleculer.ServiceBroker({
        ...brokerOptions,
        nodeID: serviceUUID
    });
}

module.exports = createGatewayBroker;
