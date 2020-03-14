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
  parseTypeDefs
} = require("../../../util/index.js");

const IdioError = require("../../idio-error.js");
/**
 * @param {import('../index.js').appliances} appliances
 * @returns {{typeDefs: string, resolvers: object}}
 */


function loadAppliances(appliances, metadata) {
  const {
    name
  } = metadata;

  if (name === "schemaGlobals") {
    if (Array.isArray(appliances)) {
      if (!appliances.length) {
        return {};
      }

      return {
        typeDefs: printWithComments(mergeTypeDefs(appliances.map(parseTypeDefs)))
      };
    }

    return {
      typeDefs: parseTypeDefs(appliances)
    };
  }

  if (!Array.isArray(appliances)) {
    throw new IdioError(`expected '${name}' to be an array.`);
  }

  const {
    typeDefs,
    resolvers
  } = appliances.reduce((result, appliance) => ({
    typeDefs: [...result.typeDefs, appliance.typeDefs],
    resolvers: _objectSpread({}, result.resolvers, {
      [appliance.name]: appliance.resolver
    })
  }), {
    typeDefs: [],
    resolvers: {}
  });
  return {
    typeDefs: printWithComments(mergeTypeDefs(typeDefs)),
    resolvers
  };
}

module.exports = loadAppliances;