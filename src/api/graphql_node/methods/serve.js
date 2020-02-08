const loadNode = require("./load-node.js");
const createNodeBroker = require("./create-node-broker.js");
const { abort } = require("../../../util/index.js");
const {
    handleIntrospection,
    introspectionCall,
    createAction
} = require("../../../util/index.js");
const CONTEXT_INDEX = require("../../../constants/context-index.js");

/**
 * @typedef {import('./create-node-broker.js').IdioBrokerOptions} IdioBrokerOptions
 * @typedef {import('../../../util/services-manager.js').ServiceManager} ServiceManager
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 */

/**
 * @typedef Runtime
 * @property {ServiceBroker} broker
 * @property {Object.<string, ServiceManager>} gatewayManagers
 * @property {boolean} initialized
 * @property {Object.<string, object>} introspection
 * @property {IdioBrokerOptions} brokerOptions
 */

/**
 * @param {IdioBrokerOptions} brokerOptions
 * @returns {Promise.<Runtime>}
 */
async function serve(brokerOptions) {
    const RUNTIME = {
        broker: createNodeBroker(this, { brokerOptions }),
        gatewayManagers: {},
        initialized: false,
        introspection: {},
        brokerOptions
    };

    const { resolvers } = loadNode(this);

    RUNTIME.introspection = {
        name: this.name,
        typeDefs: this.typeDefs,
        resolvers: Object.entries(resolvers).reduce(
            (result, [name, methods]) => ({
                ...result,
                [name]: Object.keys(methods)
            }),
            {}
        ),
        hash: this.typeDefs
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

    Object.entries(resolvers).forEach(([key, methods]) =>
        RUNTIME.broker.createService({
            name: `${RUNTIME.broker.nodeID}:${key}`,
            actions: Object.entries(methods).reduce(
                (result, [name, method]) => ({
                    ...result,
                    [name]: createAction(
                        { method, contextIndex: CONTEXT_INDEX },
                        RUNTIME
                    )
                }),
                {}
            )
        })
    );

    await Promise.all(
        [this.enums, this.unions, this.interfaces, this.nodes]
            .filter(Boolean)
            .flatMap((appliances) =>
                appliances.map((appliance) => appliance.serve(brokerOptions))
            )
    );

    await RUNTIME.broker.start();

    await RUNTIME.broker.waitForServices(
        [this.enums, this.unions, this.interfaces, this.nodes]
            .filter(Boolean)
            .flatMap((appliances) =>
                appliances.map((appliance) => appliance.name)
            )
    );

    await new Promise(introspectionCall(RUNTIME, { type: "node" }));

    return RUNTIME;
}

module.exports = serve;
