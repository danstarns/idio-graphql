/* eslint-disable global-require */
/* eslint-disable default-case */
const uuid = require("uuid/v4");

const CONTEXT_INDEX = require("../../../constants/context-index.js");
const {
    createAction,
    abort,
    introspectionCall,
    handleIntrospection
} = require("../../../util/index.js");

const createApplianceBroker = require("./create-appliance-broker.js");

/**
 * @typedef Runtime
 * @property {string} serviceUUID
 * @property {Object.<string, ServiceManager>} gatewayManagers
 * @property {Object.<string, object>} introspection
 * @property {boolean} initialized
 * @property {ServiceBroker} broker
 * @property {IdioBrokerOptions} brokerOptions
 */

module.exports = (metadata) => {
    /**
     *
     * @param {BrokerOptions} brokerOptions
     */
    async function _serveAppliance(brokerOptions) {
        const serviceUUID = `${this.name}:${brokerOptions.gateway}:${uuid()}`;

        const RUNTIME = {
            serviceUUID,
            gatewayManagers: {},
            initialized: false,
            broker: {},
            brokerOptions: { ...brokerOptions, nodeID: serviceUUID },
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
                resolver: `${serviceUUID}.resolver`
            }
        };

        RUNTIME.broker = createApplianceBroker(RUNTIME);

        const INTROSPECTION_CALL = `${brokerOptions.gateway}:introspection`;

        RUNTIME.broker.createService({
            name: this.name,
            actions: {
                [INTROSPECTION_CALL]: handleIntrospection(RUNTIME)
            }
        });

        RUNTIME.broker.createService({
            name: RUNTIME.serviceUUID,
            actions: {
                abort,
                resolver: (ctx) => {
                    if (RUNTIME.metadata.singular === "enum") {
                        return this.resolver;
                    }

                    return createAction(
                        {
                            method: this.__resolveType,
                            contextIndex: CONTEXT_INDEX - 1
                        },
                        RUNTIME
                    )(ctx);
                }
            }
        });

        await RUNTIME.broker.start();

        await new Promise(
            introspectionCall(RUNTIME, { type: RUNTIME.metadata.singular })
        );

        return RUNTIME;
    }

    return _serveAppliance;
};
