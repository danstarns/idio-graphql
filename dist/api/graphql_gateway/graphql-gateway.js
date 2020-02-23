"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const {
  createConfig,
  start
} = require("./methods/index.js");

const {
  createBroker
} = require("../../util/index.js");
/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').BrokerOptions} BrokerOptions
 * @typedef {import('../graphql_node/graphql-node.js').GraphQLNode} GraphQLNode
 * @typedef {import('../appliances/idio-enum.js').IdioEnum} IdioEnum
 * @typedef {import('../appliances/idio-scalar.js').IdioScalar} IdioScalar
 * @typedef {import('../appliances/idio-directive.js').IdioDirective} IdioDirective
 * @typedef {import('../appliances/idio-interface.js').IdioInterface} IdioInterface
 * @typedef {import('../appliances/idio-union.js').IdioUnion} IdioUnion
 * @typedef {import('./methods/start.js').Runtime} Runtime
 * @typedef {import('graphql').DocumentNode} DocumentNode
 */

/**
 * @typedef services
 * @property {string[]} nodes
 * @property {string[]} enums
 * @property {string[]} interfaces
 * @property {string[]} unions
 */

/**
 * @typedef locals
 * @property {GraphQLNode[]} nodes
 * @property {IdioEnum[]} enums
 * @property {IdioScalar[]} scalars
 * @property {IdioDirective[]} directives
 * @property {IdioInterface[]} interfaces
 * @property {IdioUnion[]} unions
 * @property {(string | DocumentNode | string[] | DocumentNode[])} schemaGlobals
 */

/**
 * @typedef GraphQLGateway
 * @property {() => Promise<Runtime>} start
 * @property {ServiceBroker} broker
 */

/**
 * @typedef GraphQLGatewayConfig
 * @property {services} services
 * @property {locals} locals
 */

/**
 *
 * You can use GraphQLGateway to orchestrate a collection of GraphQLNode's & Schema Appliances exposed over a network.
 *
 * @param {GraphQLGatewayConfig} config
 * @param {BrokerOptions} brokerOptions
 *
 * @returns {GraphQLGateway}
 */


function GraphQLGateway(config, brokerOptions = {}) {
  this.broker = createBroker({
    name: brokerOptions.nodeID
  }, {
    brokerOptions: _objectSpread({}, brokerOptions, {
      gateway: brokerOptions.nodeID
    })
  });
  this.start = start({
    config: createConfig(config),
    broker: this.broker
  });
}

module.exports = GraphQLGateway;