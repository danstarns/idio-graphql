"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.promise");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const safeJsonStringify = require("safe-json-stringify");

const IdioError = require("../../idio-error.js");

const {
  streamToIterator
} = require("../../../util/index.js");
/**
 * @typedef {import('../graphql-node.js').Runtime} Runtime
 * @typedef {import('../graphql-node.js').GraphQLNode} GraphQLNode
 */

/**
 * @param {Runtime & {GraphQLNode: GraphQLNode}} RUNTIME
 * @returns {(introspection: any) => GraphQLNode}
 */


module.exports = RUNTIME => {
  return function createLocalNode(introspection) {
    const instanceServiceManager = RUNTIME.serviceManagers.node[introspection.name];
    return new RUNTIME.GraphQLNode(_objectSpread({}, introspection, {
      resolvers: Object.entries(introspection.resolvers).reduce((result, [type, methods]) => _objectSpread({}, result, {
        [type]: methods.reduce((res, resolver) => {
          async function operation(...graphQLArgs) {
            const serviceToCall = await instanceServiceManager.getNextService();

            if (!serviceToCall) {
              throw new IdioError(`No service with name: '${introspection.name}' online.`);
            }

            try {
              const executionResult = await RUNTIME.broker.call(`${serviceToCall}:${type}.${resolver}`, {
                graphQLArgs: safeJsonStringify(graphQLArgs)
              });
              return executionResult;
            } catch ({
              message
            }) {
              throw new IdioError(`Execution on service: '${introspection.name}' failed. Error: ${message}`);
            }
          }

          if (type === "Subscription") {
            return _objectSpread({}, res, {
              [resolver]: {
                subscribe: async (...graphQLArgs) => streamToIterator((await operation(...graphQLArgs)))
              }
            });
          }

          return _objectSpread({}, res, {
            [resolver]: operation
          });
        }, {})
      }), {})
    }));
  };
};