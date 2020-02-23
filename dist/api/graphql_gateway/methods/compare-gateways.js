"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("core-js/modules/es.array.iterator");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/**
 * @typedef {import('./start.js').Runtime} Runtime
 */

/**
 * @param {Runtime} RUNTIME
 */
function compareGateways(RUNTIME) {
  const {
    broker,
    locals,
    services
  } = RUNTIME;
  const [serviceName, gatewayName] = broker.options.nodeID.split(":");
  const COMPARE_ACTION = `${serviceName}:${gatewayName}.compare`;
  return broker.emit(COMPARE_ACTION, {
    name: serviceName,
    locals: Object.entries(locals).reduce((result, [key, values]) => _objectSpread({}, result, {
      [key]: values.map(({
        name
      }) => name)
    }), {}),
    services
  });
}

module.exports = compareGateways;