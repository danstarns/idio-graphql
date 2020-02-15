"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("core-js/modules/es.array.flat-map");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.unscopables.flat-map");

require("core-js/modules/es.promise");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/**
 * @typedef {import('../graphql-gateway.js').Runtime} Runtime
 */

/**
 * @param {Runtime} RUNTIME
 */
function serveLocals(RUNTIME) {
  const {
    locals,
    broker
  } = RUNTIME;
  return Promise.all(Object.entries(locals).filter(([name]) => !["scalars", "directives", "schemaGlobals"].includes(name)).flatMap(([, value]) => value).map(local => {
    const [gateway] = broker.options.nodeID.split(":");
    return local.serve(_objectSpread({}, broker.options, {
      gateway
    }));
  }));
}

module.exports = serveLocals;