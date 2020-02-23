"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("core-js/modules/es.promise");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/* eslint-disable consistent-return */
const safeJsonStringify = require("safe-json-stringify");

const IdioEnum = require("../idio-enum.js");

const IdioUnion = require("../idio-union.js");

const IdioInterface = require("../idio-interface.js");

const IdioError = require("../../idio-error.js");

const APPLIANCE_METADATA = require("../../../constants/appliance-metadata.js");
/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 *
 * @param {object} options
 * @param {string} options.type
 * @param {ServiceBroker} options.broker
 * @param {object} options.serviceManagers
 */


function createLocalAppliance({
  type,
  broker,
  serviceManagers
}) {
  if (type !== "enums" && type !== "unions" && type !== "interfaces") {
    throw new IdioError("invalid type");
  }

  const metadata = APPLIANCE_METADATA.find(x => x.name === type);
  const serviceTypeManagers = serviceManagers[metadata.singular];
  return function _createLocalAppliance(introspection) {
    const instanceServiceManager = serviceTypeManagers[introspection.name];

    if (type === "enums") {
      return new IdioEnum(_objectSpread({}, introspection));
    }

    async function __resolveType(...graphQLArgs) {
      try {
        const serviceToCall = await instanceServiceManager.getNextService();

        if (!serviceToCall) {
          throw new IdioError(`No service with name: '${introspection.name}' online.`);
        }

        return broker.call(`${serviceToCall}.__resolveType`, {
          graphQLArgs: safeJsonStringify(graphQLArgs)
        });
      } catch ({
        message
      }) {
        throw new IdioError(`${introspection.name}.__resolveType failed, ${message}`);
      }
    }

    if (type === "unions") {
      return new IdioUnion(_objectSpread({}, introspection, {
        resolver: {
          __resolveType
        }
      }));
    }

    return new IdioInterface(_objectSpread({}, introspection, {
      resolver: {
        __resolveType
      }
    }));
  };
}

module.exports = createLocalAppliance;