const { abort } = require("../../../util/index.js");
const {
    handleIntrospection,
    introspectionCall,
    createAction,
    createBroker
} = require("../../../util/index.js");
const CONTEXT_INDEX = require("../../../constants/context-index.js");

/**
 * @typedef {import('../../../util/create-broker.js').BrokerOptions} BrokerOptions
 * @typedef {import('../../../util/services-manager.js').ServiceManager} ServiceManager
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 */

/**
 * @typedef Runtime
 * @property {ServiceBroker} broker
 * @property {Object<string, ServiceManager>} gatewayManagers
 * @property {boolean} initialized
 * @property {Object<string, object>} introspection
 * @property {IdioBrokerOptions} brokerOptions
 */

/**
 * @param {IdioBrokerOptions} brokerOptions
 * @returns {Promise<Runtime>}
 */
async function serve(brokerOptions) {
    const RUNTIME = {
        broker: createBroker(this, { brokerOptions }),
        gatewayManagers: {},
        initialized: false,
        introspection: {},
        brokerOptions
    };

    RUNTIME.introspection = {
        name: this.name,
        typeDefs: this.typeDefs,
        resolvers: Object.entries(this.resolvers).reduce(
            (result, [name, methods]) => ({
                ...result,
                [name]: Object.keys(methods)
            }),
            {}
        ),
        hash: this.typeDefs,
        services: Object.entries({
            nodes: this.nodes,
            enums: this.enums,
            interfaces: this.interfaces,
            unions: this.unions
        }).reduce((result, [key, values]) => {
            if (!values) {
                return result;
            }

            return {
                ...result,
                [key]: values.map((x) => x.name)
            };
        }, {})
    };

    const INTROSPECTION_CALL = `${brokerOptions.gateway}:introspection`;

    RUNTIME.broker.createService({
        name: this.name,
        actions: {
            [INTROSPECTION_CALL]: handleIntrospection(RUNTIME)
        }
    });

    RUNTIME.broker.createService({
        name: RUNTIME.broker.nodeID,
        actions: { abort }
    });

    Object.entries(this.resolvers).forEach(([key, methods]) =>
        RUNTIME.broker.createService({
            name: `${RUNTIME.broker.nodeID}:${key}`,
            actions: Object.entries(methods).reduce(
                (result, [name, method]) => ({
                    ...result,
                    [name]: createAction(
                        {
                            method,
                            contextIndex: CONTEXT_INDEX
                        },
                        RUNTIME
                    )
                }),
                {}
            )
        })
    );

    const appliances = [this.enums, this.unions, this.interfaces, this.nodes]
        .filter(Boolean)
        .reduce((result, value) => [...result, ...value], []);

    await Promise.all(appliances.map((x) => x.serve(brokerOptions)));

    await RUNTIME.broker.start();

    await RUNTIME.broker.waitForServices(appliances.map(({ name }) => name));

    await new Promise(introspectionCall(RUNTIME, { type: "node" }));

    return RUNTIME;
}

module.exports = serve;
