"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("core-js/modules/es.array.iterator");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const IdioError = require("../../idio-error.js");

const GraphQLNode = require("../../graphql_node/graphql-node.js");

const {
  checkInstance
} = require("../../../util/index.js");

const {
  IdioScalar,
  IdioEnum,
  IdioDirective,
  IdioInterface,
  IdioUnion
} = require("../../appliances/index.js");
/**
 * @typedef {import('../graphql-gateway.js').GraphQLGatewayConfig} GraphQLGatewayConfig
 * @typedef {import('../graphql-gateway.js').locals} locals
 * @typedef {import('../graphql-gateway.js').services} services
 */

/**
 * @param {services} services
 * @returns {services}
 */


function validateServices(services = {}) {
  if (!(typeof services === "object")) {
    throw new IdioError("services must be of type object.");
  }

  const {
    nodes,
    enums,
    interfaces,
    unions,
    directives,
    scalars
  } = services;

  if (directives) {
    throw new IdioError(`services.directives not supported`);
  }

  if (scalars) {
    throw new IdioError(`services.scalars not supported`);
  }

  return Object.entries({
    nodes,
    enums,
    interfaces,
    unions
  }).reduce((result, [key, values = []]) => {
    if (!Array.isArray(values)) {
      throw new IdioError(`services.${key} must be of type array`);
    }

    values.forEach((value, index) => {
      if (!(typeof value === "string")) {
        throw new IdioError(`services.${key}[${index}] must be of type string.`);
      }
    });
    return _objectSpread({}, result, {
      [key]: values
    });
  }, {});
}
/**
 *
 * @param {locals} locals
 * @returns {locals}
 */


function validateLocals(locals = {}) {
  if (!(typeof locals === "object")) {
    throw new IdioError("locals must be of type object.");
  }

  let {
    nodes,
    enums,
    scalars,
    directives,
    interfaces,
    unions,
    schemaGlobals = []
  } = locals;

  if (typeof schemaGlobals === "string") {
    schemaGlobals = [schemaGlobals];
  }

  return _objectSpread({
    schemaGlobals
  }, Object.entries({
    nodes: {
      instances: nodes,
      of: GraphQLNode
    },
    enums: {
      instances: enums,
      of: IdioEnum
    },
    scalars: {
      instances: scalars,
      of: IdioScalar
    },
    directives: {
      instances: directives,
      of: IdioDirective
    },
    interfaces: {
      instances: interfaces,
      of: IdioInterface
    },
    unions: {
      instances: unions,
      of: IdioUnion
    }
  }).reduce((result, [key, {
    instances = [],
    of
  }]) => {
    if (!Array.isArray(instances)) {
      throw new IdioError(`locals.${key} must be of type array.`);
    }

    instances.forEach((instance, index) => checkInstance({
      instance,
      of,
      name: `locals.${key}[${index}]`
    }));
    return _objectSpread({}, result, {
      [key]: instances
    });
  }, {}));
}
/**
 * @param {GraphQLGatewayConfig} config
 */


function createConfig(config) {
  if (!config) {
    throw new IdioError("config required.");
  }

  if (!(typeof config === "object")) {
    throw new IdioError("config must be of type object.");
  }

  const services = validateServices(config.services);
  const locals = validateLocals(config.locals);

  if (!services.nodes.length && !locals.nodes.length) {
    throw new IdioError(`no declared nodes, provide a list of local or remote nodes.`);
  }

  return {
    services,
    locals
  };
}

module.exports = createConfig;