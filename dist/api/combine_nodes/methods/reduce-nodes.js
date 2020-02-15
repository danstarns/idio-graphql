"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("core-js/modules/es.array.iterator");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/* eslint-disable prettier/prettier */
const {
  loadNode
} = require("../../graphql_node/methods/index.js");

const {
  execute
} = require("../../../util/index.js");

const CONTEXT_INDEX = require("../../../constants/context-index.js");
/**
 * @typedef {import('../../graphql_node/graphql-node.js').GraphQLNode} GraphQLNode
 * @typedef {GraphQLNode[]} nodes
 */

/**
 *  @typedef reducedNodes
 *  @property {string[]} typeDefs
 *  @property {object} resolvers
 */


function inject(methods, RUNTIME) {
  return Object.entries(methods).reduce((result, [key, method]) => {
    const createArgs = graphQLArgs => {
      if (!graphQLArgs[CONTEXT_INDEX]) {
        graphQLArgs[CONTEXT_INDEX] = {};
      }

      if (!graphQLArgs[CONTEXT_INDEX].injections) {
        graphQLArgs[CONTEXT_INDEX].injections = {};
      }

      if (!(typeof graphQLArgs[CONTEXT_INDEX].injections === "object")) {
        graphQLArgs[CONTEXT_INDEX].injections = {};
      }

      graphQLArgs[CONTEXT_INDEX].injections = _objectSpread({}, graphQLArgs[CONTEXT_INDEX].injections, {
        execute: execute.withSchema(RUNTIME.schema)
      });
      return graphQLArgs;
    };

    return _objectSpread({}, result, {}, method.subscribe ? {
      [key]: _objectSpread({}, method, {
        subscribe: (...graphQLArgs) => method.subscribe(...createArgs(graphQLArgs))
      })
    } : {
      [key]: (...graphQLArgs) => method(...createArgs(graphQLArgs))
    });
  }, {});
}
/**
 *
 * @param {reducedNodes} r
 * @param {GraphQLNode} node
 */


function reduceNode(r, node, RUNTIME) {
  let result = Object.assign({}, r);
  result.typeDefs.push(node.typeDefs);
  result.resolvers = _objectSpread({}, result.resolvers, {}, Object.entries(node.resolvers).filter(([key]) => key !== "Fields").reduce((res, [key, methods]) => _objectSpread({}, res, {}, result.resolvers[key] ? {
    [key]: _objectSpread({}, result.resolvers[key], {}, inject(methods, RUNTIME))
  } : {
    [key]: inject(methods, RUNTIME)
  }), {}), {}, node.resolvers.Fields ? {
    [node.name]: node.resolvers.Fields
  } : {});

  if (node.nodes) {
    const {
      resolvers: nestedResolvers,
      typeDefs: nestedTypeDefs
    } = node.nodes.map(loadNode).reduce((_result, _node) => reduceNode(_result, _node, RUNTIME), {
      typeDefs: [],
      resolvers: {}
    });
    result = _objectSpread({}, result, {
      typeDefs: [...result.typeDefs, ...nestedTypeDefs],
      resolvers: Object.entries(result.resolvers).reduce((res, [key, value]) => _objectSpread({}, res, {}, nestedResolvers[key] ? {
        [key]: _objectSpread({}, nestedResolvers[key], {}, value)
      } : {
        [key]: value
      }), {})
    });
  }

  return result;
}
/**
 * @param {nodes} nodes
 * @returns {reducedNodes}
 */


function reduceNodes(nodes, RUNTIME) {
  return nodes.map(loadNode).reduce((result, node) => reduceNode(result, node, RUNTIME), {
    typeDefs: [],
    resolvers: {}
  });
}

module.exports = reduceNodes;