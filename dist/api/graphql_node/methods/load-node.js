"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("core-js/modules/es.array.iterator");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const APPLIANCE_METADATA = require("../../../constants/appliance-metadata.js");

const {
  loadAppliances
} = require("../../appliances/methods/index.js");
/**
 * @typedef {import('../graphql-node.js').GraphQLNode} GraphQLNode
 * @typedef {import('../../appliances/index.js').IdioEnum} IdioEnum
 * @typedef {import('../../appliances/index.js').IdioInterface} IdioInterface
 * @typedef {import('../../appliances/index.js').IdioUnion} IdioUnion
 */

/**
 * @typedef appliances
 * @property {IdioEnum[]} enums
 * @property {IdioInterface[]} interfaces
 * @property {IdioUnion[]} unions
 */

/**
 * @param {GraphQLNode} node
 */


function loadNode(node) {
  /** @type {appliances} */
  const appliances = Object.entries({
    enums: node.enums,
    interfaces: node.interfaces,
    unions: node.unions
  }).filter(([, value]) => Boolean(value)).reduce((result, [key, _appliances]) => {
    const metadata = APPLIANCE_METADATA.find(({
      name
    }) => name === key);
    const {
      typeDefs,
      resolvers
    } = loadAppliances(_appliances, metadata);
    result.typeDefs += `\n${typeDefs}\n`;
    return _objectSpread({}, result, {
      resolvers: _objectSpread({}, result.resolvers, {}, resolvers)
    });
  }, {
    typeDefs: "",
    resolvers: {}
  });
  node.typeDefs = `${node.typeDefs} \n ${appliances.typeDefs}`;
  node.resolvers = _objectSpread({}, node.resolvers, {}, appliances.resolvers);
  return node;
}

module.exports = loadNode;