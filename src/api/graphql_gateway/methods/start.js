const { makeExecutableSchema } = require("graphql-tools");
const combineNodes = require("../../combine_nodes/combine-nodes.js");
const GraphQLNode = require("../../graphql_node/graphql-node.js");

const { createLocalNode } = require("../../graphql_node/methods/index.js");

const serveLocals = require("./serve-locals.js");
const checkForServices = require("./check-for-services.js");
const createGatewayService = require("./create-gateway-service.js");
const createLocalAppliances = require("./create-local-appliances.js");
const compareGateways = require("./compare-gateways.js");

/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').BrokerOptions} BrokerOptions
 * @typedef {import('../graphql-gateway.js').config} config
 * @typedef {import('../graphql-gateway.js').Runtime} Runtime
 */

/**
 * @typedef Runtime
 * @property {locals} locals
 * @property {services} services
 * @property {services} registeredServices
 * @property {services} waitingServices
 * @property {Object.<string, ServiceManager>} serviceManagers
 * @property {string} typeDefs
 * @property {Object} resolvers
 * @property {Object} resolvers.Query
 * @property {Object} resolvers.Mutation
 * @property {Object} resolvers.Subscription
 * @property {Object} schemaDirectives
 * @property {ServiceBroker} broker
 * @property {GraphQLSchema} schema
 */

/**
 * @param {Object} curry
 * @param {config} curry.config
 * @param {ServiceBroker} curry.broker
 */
module.exports = ({ config, broker }) => {
    /**
     * Builds & orchestrates a schema from multiple sources on the network.
     *
     * @returns {Runtime}
     */
    return async function start() {
        /** @typedef {RUNTIME} */
        const RUNTIME = {
            locals: config.locals,
            services: config.services,
            registeredServices: {
                nodes: [],
                enums: [],
                interfaces: [],
                unions: []
            },
            waitingServices: {
                nodes: [...(config.services.nodes || [])],
                enums: [...(config.services.enums || [])],
                interfaces: [...(config.services.interfaces || [])],
                unions: [...(config.services.unions || [])]
            },
            serviceManagers: {
                node: {},
                enum: {},
                interface: {},
                union: {}
            },
            typeDefs: "",
            resolvers: {},
            schemaDirectives: {},
            broker,
            schema: {}
        };

        createGatewayService(RUNTIME);

        await RUNTIME.broker.start();

        await serveLocals(RUNTIME);

        await compareGateways(RUNTIME);

        await new Promise(checkForServices(RUNTIME));

        const nodes = RUNTIME.registeredServices.nodes.map(
            createLocalNode({
                ...RUNTIME,
                GraphQLNode
            })
        );

        ({
            typeDefs: RUNTIME.typeDefs,
            resolvers: RUNTIME.resolvers,
            schemaDirectives: RUNTIME.schemaDirectives
        } = await combineNodes(nodes, createLocalAppliances(RUNTIME)));

        RUNTIME.schema = makeExecutableSchema({
            typeDefs: RUNTIME.typeDefs,
            resolvers: RUNTIME.resolvers,
            schemaDirectives: RUNTIME.schemaDirectives
        });

        return RUNTIME;
    };
};
