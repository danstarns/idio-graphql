"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/* eslint-disable import/no-extraneous-dependencies */

/* eslint-disable global-require */
const uuid = require("uuid/v4");

const IdioError = require("../../src/api/idio-error.js");
/**
 * @typedef {import('moleculer').BrokerOptions & {gateway: string}} BrokerOptions
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 */

/**
 *
 * @param {{name: string}} instance
 * @param {{BrokerOptions: brokerOptions}} RUNTIME
 *
 * @returns {ServiceBroker}
 */


function createBroker(instance, RUNTIME) {
  const {
    brokerOptions
  } = RUNTIME;

  if (!brokerOptions) {
    throw new IdioError("brokerOptions required.");
  }

  if (!brokerOptions.transporter) {
    throw new IdioError("brokerOptions.transporter required.");
  }

  if (!brokerOptions.gateway) {
    throw new IdioError("brokerOptions.gateway required.");
  }

  let moleculer;

  try {
    moleculer = require("moleculer");
  } catch (error) {
    /* istanbul ignore next */
    throw new IdioError(`Cant find module: 'moleculer' install using npm install --save moleculer`);
  }

  const serviceUUID = `${instance.name}:${brokerOptions.gateway}:${uuid()}`;
  return new moleculer.ServiceBroker(_objectSpread({}, brokerOptions, {
    nodeID: serviceUUID
  }));
}

module.exports = createBroker;