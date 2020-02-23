"use strict";

require("core-js/modules/es.promise");

/* eslint-disable global-require */

/* eslint-disable default-case */
const CONTEXT_INDEX = require("../../../constants/context-index.js");

const {
  createAction,
  abort,
  introspectionCall,
  handleIntrospection,
  createBroker
} = require("../../../util/index.js");
/**
 * @typedef Runtime
 * @property {IdioBrokerOptions} brokerOptions
 * @property {ServiceBroker} broker
 * @property {Object.<string, ServiceManager>} gatewayManagers
 * @property {boolean} initialized
 * @property {Object.<string, object>} introspection
 */


module.exports = metadata => {
  /**
   *
   * @param {BrokerOptions} brokerOptions
   */
  async function _serveAppliance(brokerOptions) {
    const broker = createBroker(this, {
      brokerOptions
    });
    /** @type {Runtime} */

    const RUNTIME = {
      broker,
      brokerOptions,
      gatewayManagers: {},
      initialized: false,
      metadata,
      appliance: {
        name: this.name,
        typeDefs: this.typeDefs,
        resolver: this.resolver,
        __resolveType: this.__resolveType
      },
      introspection: {
        name: this.name,
        typeDefs: this.typeDefs,
        resolver: `${broker.options.nodeID}.resolver`
      }
    };
    const INTROSPECTION_CALL = `${brokerOptions.gateway}:introspection`;
    RUNTIME.broker.createService({
      name: this.name,
      actions: {
        [INTROSPECTION_CALL]: handleIntrospection(RUNTIME)
      }
    });
    RUNTIME.broker.createService({
      name: RUNTIME.broker.options.nodeID,
      actions: {
        abort,
        resolver: ctx => {
          if (RUNTIME.metadata.singular === "enum") {
            return this.resolver;
          }

          return createAction({
            method: this.__resolveType,
            contextIndex: CONTEXT_INDEX - 1
          }, RUNTIME)(ctx);
        }
      }
    });
    await RUNTIME.broker.start();
    await new Promise(introspectionCall(RUNTIME, {
      type: RUNTIME.metadata.singular
    }));
    return RUNTIME;
  }

  return _serveAppliance;
};