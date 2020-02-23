/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable global-require */
const uuid = require("uuid/v4");
const IdioError = require("../api/idio-error.js");

/**
 * @typedef {import('moleculer').BrokerOptions & {gateway: string}} BrokerOptions
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 */

/**
 *
 * @param {{name: string}} instance
 * @param {{BrokerOptions: brokerOptions}} RUNTIME
 *
 * @returns {ServiceBroker}
 */
function createBroker(instance, RUNTIME) {
    const { brokerOptions } = RUNTIME;

    if (!instance.name) {
        throw new IdioError("instance.name required");
    }

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
        /* istanbul ignore next */
        throw new IdioError(
            `Cant find module: 'moleculer' install using npm install --save moleculer`
        );
    }

    const serviceUUID = `${instance.name}:${brokerOptions.gateway}:${uuid()}`;

    return new moleculer.ServiceBroker({
        ...brokerOptions,
        nodeID: serviceUUID
    });
}

module.exports = createBroker;
