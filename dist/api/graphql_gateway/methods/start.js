"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.promise");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const combineNodes = require("../../combine_nodes/combine-nodes.js");

const GraphQLNode = require("../../graphql_node/graphql-node.js");

const {
  createLocalNode
} = require("../../graphql_node/methods/index.js");

const serveLocals = require("./serve-locals.js");

const checkForServices = require("./check-for-services.js");

const createGatewayService = require("./create-gateway-service.js");

const createLocalAppliances = require("./create-local-appliances.js");

const compareGateways = require("./compare-gateways.js");
/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('../graphql-gateway.js').config} config
 * @typedef {import('graphql').GraphQLSchema} GraphQLSchema
 */

/**
 * @typedef Runtime
 * @property {locals} locals
 * @property {services} services
 * @property {services} registeredServices
 * @property {services} waitingServices
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
 * @param {config} curry.config
 * @param {ServiceBroker} curry.broker
 */


module.exports = ({
  config,
  broker
}) => {
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
    ({
      typeDefs: RUNTIME.typeDefs,
      resolvers: RUNTIME.resolvers,
      schemaDirectives: RUNTIME.schemaDirectives,
      schema: RUNTIME.schema
    } = combineNodes(RUNTIME.registeredServices.nodes.map(createLocalNode(_objectSpread({}, RUNTIME, {
      GraphQLNode
    }))), createLocalAppliances(RUNTIME)));
    return RUNTIME;
  };
};