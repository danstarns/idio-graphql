"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("core-js/modules/es.array.iterator");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const {
  loadAppliances
} = require("../../appliances/methods/index.js");

const APPLIANCE_METADATA = require("../../../constants/appliance-metadata");
/**
 * @typedef result
 * @property {string[]} typeDefs
 * @property {object} resolvers
 * @property {object} schemaDirectives
 */

/**
 * @param {import('../combine-nodes.js').appliances} _appliances
 */


function reduceAppliances(_appliances) {
  return Object.entries(_appliances).reduce((
  /** @type {result} */
  result, [key, appliances]) => {
    if (!appliances.length && key !== "schemaGlobals") {
      return result;
    }

    const metadata = APPLIANCE_METADATA.find(x => x.name === key);

    if (!metadata) {
      return result;
    }

    const {
      typeDefs,
      resolvers = {}
    } = loadAppliances(appliances, metadata);
    result.typeDefs.push(typeDefs);

    if (metadata.name === "directives") {
      return _objectSpread({}, result, {
        schemaDirectives: _objectSpread({}, result.schemaDirectives, {}, resolvers)
      });
    }

    return _objectSpread({}, result, {
      resolvers: _objectSpread({}, result.resolvers, {}, resolvers)
    });
  }, {
    resolvers: {},
    typeDefs: [],
    schemaDirectives: {}
  });
}

module.exports = reduceAppliances;