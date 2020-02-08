/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable global-require */
const uuid = require("uuid/v4");
const IdioError = require("../../idio-error.js");

/**
 * @typedef {import('moleculer').BrokerOptions} BrokerOptions
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 */

function createApplianceBroker(appliance, RUNTIME) {
    const { brokerOptions } = RUNTIME;

    if (!brokerOptions) {
        throw new IdioError("brokerOptions required.");
    }

    if (!brokerOptions.transporter) {
        throw new IdioError("brokerOptions.transporter required.");
    }

    if (!brokerOptions.gateway) {
        throw new IdioError("brokerOptions.gateway required.");
    }

    let moleculer;

    try {
        moleculer = require("moleculer");
    } catch (error) {
        throw new IdioError(
            `Cant find module: 'moleculer' install using npm install --save moleculer`
        );
    }

    const serviceUUID = `${appliance.name}:${brokerOptions.gateway}:${uuid()}`;

    return new moleculer.ServiceBroker({
        ...brokerOptions,
        nodeID: serviceUUID
    });
}

module.exports = createApplianceBroker;
