"use strict";

require("core-js/modules/es.array.flat-map");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.unscopables.flat-map");

require("core-js/modules/es.promise");

const util = require("util");

const APPLIANCE_METADATA = require("../../../constants/appliance-metadata.js");

const introspectionCall = require("./introspection-call.js");

const sleep = util.promisify(setTimeout);
const applianceMetadata = [...APPLIANCE_METADATA, {
  singular: "node",
  name: "nodes"
}];
/**
 * @typedef {import('../graphql-gateway.js').Runtime} Runtime
 */

/**
 * @param {Runtime} RUNTIME
 */

module.exports = RUNTIME => {
  const {
    broker
  } = RUNTIME;
  return async function checkForServices(resolve, reject) {
    const waiting = Object.entries(RUNTIME.waitingServices).filter(([, services]) => Boolean(services.length));

    if (waiting.length) {
      await Promise.all(waiting.flatMap(async ([key, services]) => {
        const {
          singular
        } = applianceMetadata.find(({
          name
        }) => name === key);
        broker.logger.info(`Waiting for ${singular} services: [${services.join(", ")}]`);
        return services.map(service => introspectionCall(RUNTIME)(`${service}:${broker.options.nodeID}`, singular));
      }));
      await sleep(1000);
      setImmediate(checkForServices, resolve, reject);
    } else {
      return resolve();
    }
  };
};