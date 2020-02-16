"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("core-js/modules/es.array.iterator");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const {
  createLocalAppliance
} = require("../../appliances/methods/index.js");
/**
 * @typedef {import('../graphql-gateway.js').Runtime} Runtime
 */

/**
 * @param {Runtime} RUNTIME
 */


module.exports = function createLocalAppliances(RUNTIME) {
  const {
    registeredServices,
    broker,
    serviceManagers,
    locals
  } = RUNTIME;
  return _objectSpread({}, ["locals", "directives", "schemaGlobals"].reduce((res, type) => _objectSpread({}, res, {}, locals[type] ? {
    [type]: locals[type]
  } : {}), {}), {}, Object.entries(registeredServices).filter(([key]) => key !== "nodes").reduce((result, [key, values]) => _objectSpread({}, result, {
    [key]: values.map(createLocalAppliance({
      type: key,
      broker,
      serviceManagers
    }))
  }), {}));
};