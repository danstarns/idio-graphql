const {
    validateAppliances,
    createGatewayBroker,
    start
} = require("./methods/index.js");

/**
 * @typedef {import('../../graphql-node.js')} GraphQLNode
 * @typedef {import('../../idio-scalar.js')} IdioScalar
 * @typedef {import('../../idio-enum.js')} IdioEnum
 * @typedef {import('../../idio-directive.js')} IdioDirective
 *
 * @typedef {import('./methods/validate-appliances.js')} appliances
 * @typedef {import('./methods/create-gateway-broker.js')} brokerOptions
 */

/**
 * @typedef {Object} GraphQLGateway
 * @property {string} appliances
 * @property {Object} broker - https://moleculer.services/docs.
 * @property {Array.<string>} REGISTERED_SERVICES - Registered services
 * @property {Array.<string>} WAITING_SERVICES - Waiting services
 * @property {boolean} started - If the gateway has started, IE complied a schema.
 * @property {boolean} start - Serve The gateway on the network.
 */

/**
 * Builds & orchestrates a schema from multiple sources on the network.
 *
 * @param {appliances} appliances
 * @param {brokerOptions} brokerOptions - https://moleculer.services/docs/0.13/broker.html#Broker-options
 */
function GraphQLGateway(appliances, brokerOptions) {
    this.appliances = validateAppliances(appliances);
    this.broker = createGatewayBroker(brokerOptions);

    this.REGISTERED_SERVICES = [];
    this.WAITING_SERVICES = [...this.appliances.dependencies];
    this.started = false;
}

GraphQLGateway.prototype.start = start;

module.exports = GraphQLGateway;
