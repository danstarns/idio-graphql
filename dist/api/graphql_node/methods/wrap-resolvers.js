"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("core-js/modules/es.array.iterator");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _awaitAsyncGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/awaitAsyncGenerator"));

var _wrapAsyncGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapAsyncGenerator"));

var _asyncIterator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncIterator"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/* eslint-disable no-restricted-syntax */
const INDEX = require("../../../constants/context-index.js");

const {
  wrappedResolver,
  isFunction
} = require("../../../util/index.js");

const IdioError = require("../../idio-error.js");

const {
  injectGraphQLArgs
} = require("../../../util/index.js");

function wrapResolvers(node) {
  const prefix = `GraphQLNode with name: '${node.name}'`;
  return ["Query", "Mutation", "Subscription", "Fields"].reduce((resolvers, type) => {
    const methods = node.resolvers[type];

    if (methods) {
      Object.keys(methods).forEach(name => {
        const method = methods[name];

        if (!resolvers[type]) {
          resolvers[type] = {};
        }

        if (isFunction(method)) {
          resolvers = _objectSpread({}, resolvers, {
            [type]: _objectSpread({}, resolvers[type], {
              [name]: wrappedResolver(method, {
                name: `${node.name}.resolvers.${type}.${name}`,
                injections: node.injections
              })
            })
          });
          return;
        }

        if (Object.keys(method).includes("subscribe")) {
          resolvers[type][name] = _objectSpread({}, method, {
            subscribe(...graphQLArgs) {
              return (0, _wrapAsyncGenerator2.default)(function* () {
                try {
                  if (!graphQLArgs[INDEX]) {
                    graphQLArgs[INDEX] = {};
                  }

                  graphQLArgs = injectGraphQLArgs({
                    graphQLArgs,
                    injections: node.injections
                  });
                  const iterator = yield (0, _awaitAsyncGenerator2.default)(method.subscribe(...graphQLArgs));
                  var _iteratorNormalCompletion = true;
                  var _didIteratorError = false;

                  var _iteratorError;

                  try {
                    for (var _iterator = (0, _asyncIterator2.default)(iterator), _step, _value; _step = yield (0, _awaitAsyncGenerator2.default)(_iterator.next()), _iteratorNormalCompletion = _step.done, _value = yield (0, _awaitAsyncGenerator2.default)(_step.value), !_iteratorNormalCompletion; _iteratorNormalCompletion = true) {
                      const next = _value;
                      yield next;
                    }
                  } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                  } finally {
                    try {
                      if (!_iteratorNormalCompletion && _iterator.return != null) {
                        yield (0, _awaitAsyncGenerator2.default)(_iterator.return());
                      }
                    } finally {
                      if (_didIteratorError) {
                        throw _iteratorError;
                      }
                    }
                  }
                } catch (error) {
                  throw new IdioError(`${prefix} resolvers.${type}.${name} failed:\n${error}`);
                }
              })();
            }

          });
          return;
        }

        if (Object.keys(method).includes("resolve")) {
          const {
            pre,
            resolve,
            post
          } = method;
          resolvers[type][name] = wrappedResolver(resolve, {
            pre,
            post,
            name: `${node.name}.resolvers.${type}.${name}`,
            injections: node.injections
          });
          return;
        }

        throw new IdioError(`${prefix} has resolver.${type}.${name} that requires a 'resolve' method.`);
      });
    }

    return resolvers;
  }, {});
}

module.exports = wrapResolvers;