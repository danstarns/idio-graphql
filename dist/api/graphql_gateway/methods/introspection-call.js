"use strict";

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.promise");

const {
  ServicesManager
} = require("../../../util/index.js");

const APPLIANCE_METADATA = require("../../../constants/appliance-metadata.js");

const applianceMetadata = [...APPLIANCE_METADATA, {
  singular: "node",
  name: "nodes"
}];
/**
 * @typedef {import('./start.js').Runtime} Runtime
 */

/**
 * @param {Runtime} RUNTIME
 */

module.exports = RUNTIME => {
  const {
    broker
  } = RUNTIME;
  return async function introspectionCall(service, type) {
    /**
     * @typedef introspection
     * @param {string} name
     * @param {string} typeDefs
     * @param {Object} resolvers
     * @param {string} hash
     */
    let introspection;
    const [serviceName, gateway] = service.split(":");
    const INTROSPECTION_CALL = `${serviceName}.${gateway}:introspection`;

    try {
      const introspectionBody = {
        gateway: broker.options.nodeID,
        hash: broker.options.nodeID
      };
      introspection = await broker.call(INTROSPECTION_CALL, introspectionBody);
    } catch (error) {
      return;
    }

    if (!RUNTIME.serviceManagers[type]) {
      RUNTIME.serviceManagers[type] = {};
    }

    if (!RUNTIME.serviceManagers[type][serviceName]) {
      RUNTIME.serviceManagers[type][serviceName] = new ServicesManager(service, {
        broker,
        hash: introspection.hash
      });
      const {
        name
      } = applianceMetadata.find(({
        singular
      }) => singular === type);

      if (!RUNTIME.waitingServices[name]) {
        RUNTIME.waitingServices[name] = [];
      }

      if (RUNTIME.waitingServices[name].includes(introspection.name)) {
        RUNTIME.waitingServices[name] = RUNTIME.waitingServices[name].filter(x => x !== introspection.name);
      }

      if (!RUNTIME.registeredServices[name]) {
        RUNTIME.registeredServices[name] = [];
      }

      RUNTIME.registeredServices[name].push(introspection);
    }

    RUNTIME.serviceManagers[type][serviceName].push(service);
  };
};