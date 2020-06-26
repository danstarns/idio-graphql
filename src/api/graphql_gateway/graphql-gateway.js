const { createConfig, start } = require("./methods/index.js");
const { createBroker } = require("../../util/index.js");

/**
 * @typedef {import('moleculer').BrokerOptions} BrokerOptions
 * @typedef {import('../../../index').Locals} Locals
 * @typedef {import('../../../index').Services} Services
 */

/**
 * You can use GraphQLGateway to orchestrate a collection of GraphQLNode's & Schema Appliances exposed over a network.
 */
class GraphQLGateway {
    /**
     * @param {{services: Services, locals: Locals}} config
     * @param {BrokerOptions} brokerOptions
     */
    constructor(config, brokerOptions = {}) {
        if (!brokerOptions.nodeID) {
            throw new Error("brokerOptions.nodeID required");
        }

        this.broker = createBroker(
            { name: brokerOptions.nodeID },
            {
                brokerOptions: {
                    ...brokerOptions,
                    gateway: brokerOptions.nodeID
                }
            }
        );

        this.start = start({
            config: createConfig(config),
            broker: this.broker
        });
    }
}

module.exports = GraphQLGateway;
