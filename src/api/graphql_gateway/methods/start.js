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
 * @typedef {import('graphql').GraphQLSchema} GraphQLSchema
 * @typedef {import('../../../../index').Locals} Locals
 * @typedef {import('../../../../index').Services} Services
 *
 */

/**
 * @typedef RegisteredServices
 * @property {Locals["nodes"]} nodes
 * @property {Locals["enums"]} enums
 * @property {Locals["interfaces"]} interfaces
 * @property {Locals["unions"]} unions
 * @property {Locals["types"]} types
 */

/**
 * @typedef Runtime
 * @property {Locals} locals
 * @property {Services} services
 * @property {RegisteredServices} registeredServices
 * @property {Services} waitingServices
 * @property {Object<string, ServiceManager>} serviceManagers
 * @property {string} typeDefs
 * @property {object} resolvers
 * @property {object} resolvers.Query
 * @property {object} resolvers.Mutation
 * @property {object} resolvers.Subscription
 * @property {object} schemaDirectives
 * @property {ServiceBroker} broker
 * @property {GraphQLSchema} schema
 */

/**
 * @param {object} curry
 * @param {{services: Services, locals: Locals}} curry.config
 * @param {ServiceBroker} curry.broker
 *
 * @returns {() => Promise<Runtime>}
 */
module.exports = ({ config, broker } = {}) => {
    return async function start() {
        /** @typedef {Runtime} */
        const RUNTIME = {
            locals: config.locals,
            services: config.services,
            registeredServices: {
                nodes: [],
                enums: [],
                interfaces: [],
                unions: [],
                types: []
            },
            waitingServices: {
                nodes: [...(config.services.nodes || [])],
                enums: [...(config.services.enums || [])],
                interfaces: [...(config.services.interfaces || [])],
                unions: [...(config.services.unions || [])],
                types: [...(config.services.types || [])]
            },
            serviceManagers: {
                node: {},
                enum: {},
                interface: {},
                union: {},
                types: {}
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

        ({
            typeDefs: RUNTIME.typeDefs,
            resolvers: RUNTIME.resolvers,
            schemaDirectives: RUNTIME.schemaDirectives,
            schema: RUNTIME.schema,
            execute: RUNTIME.execute
        } = combineNodes(
            RUNTIME.registeredServices.nodes.map(
                createLocalNode({
                    ...RUNTIME,
                    GraphQLNode
                })
            ),
            createLocalAppliances(RUNTIME)
        ));

        return RUNTIME;
    };
};
