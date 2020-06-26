/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable global-require */
const { v4: uuid } = require("uuid");

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
        throw new Error("instance.name required");
    }

    if (!brokerOptions) {
        throw new Error("brokerOptions required.");
    }

    if (!brokerOptions.transporter) {
        throw new Error("brokerOptions.transporter required.");
    }

    if (!brokerOptions.gateway) {
        throw new Error("brokerOptions.gateway required.");
    }

    let moleculer;

    try {
        moleculer = require("moleculer");
    } catch (error) {
        /* istanbul ignore next */
        throw new Error(
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
