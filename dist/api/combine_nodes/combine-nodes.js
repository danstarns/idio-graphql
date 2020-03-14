"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("core-js/modules/es.array.iterator");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const {
  mergeTypeDefs,
  printWithComments
} = require("@graphql-toolkit/schema-merging");

const {
  makeExecutableSchema
} = require("graphql-tools");

const {
  validateAppliances,
  validateNodes,
  reduceNodes,
  reduceAppliances
} = require("./methods/index.js");

const {
  execute
} = require("../../util/index.js");
/**
 * @typedef {import('../graphql_node/graphql-node.js').GraphQLNode} GraphQLNode
 * @typedef {import('../appliances/index.js').appliances} appliances
 * @typedef {import('graphql').GraphQLSchema} GraphQLSchema
 * @typedef {import('../../util/execute.js').execute} execute
 */

/**
 * @typedef RUNTIME
 * @property {object} REGISTERED_NAMES
 * @property {GraphQLSchema} schema
 * @property {string} typeDefs
 * @property {object} resolvers
 * @property {object} resolvers.Query
 * @property {object} resolvers.Mutation
 * @property {object} resolvers.Subscription
 * @property {object} schemaDirectives
 * @property {execute} execute
 */

/**
 * You can use combineNodes to snap GraphQLNode's & Schema Appliances together into a single Schema.
 *
 * @param {GraphQLNode[]} nodes
 * @param {appliances} appliances
 * @returns {RUNTIME}
 */


function combineNodes(nodes, appliances = {}) {
  const RUNTIME = {
    REGISTERED_NAMES: {},
    schema: {},
    typeDefs: "",
    resolvers: {},
    schemaDirectives: {}
  };
  validateNodes(nodes, RUNTIME);
  validateAppliances(appliances, RUNTIME);
  const reducedNodes = reduceNodes(nodes, RUNTIME);
  const reducedAppliances = reduceAppliances(appliances);
  RUNTIME.typeDefs = printWithComments(mergeTypeDefs([...reducedNodes.typeDefs, ...reducedAppliances.typeDefs]));
  RUNTIME.resolvers = _objectSpread({}, reducedNodes.resolvers, {}, reducedAppliances.resolvers);
  RUNTIME.schemaDirectives = reducedAppliances.schemaDirectives;
  RUNTIME.schema = makeExecutableSchema({
    resolvers: RUNTIME.resolvers,
    typeDefs: RUNTIME.typeDefs,
    schemaDirectives: RUNTIME.schemaDirectives
  });
  RUNTIME.execute = execute.withSchema(RUNTIME.schema);
  return RUNTIME;
}

module.exports = combineNodes;