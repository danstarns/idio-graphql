const uuid = require("uuid/v4");
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
 * @typedef {import('../graphql-node.js').Runtime} Runtime
 */

/**
 * @param {IdioBrokerOptions} brokerOptions
 * @returns {Promise.<Runtime>}
 */
async function serve(brokerOptions) {
    const serviceUUID = `${this.name}:${brokerOptions.gateway}:${uuid()}`;

    const RUNTIME = {
        serviceUUID,
        gatewayManagers: {},
        initialized: false,
        introspection: {},
        broker: {},
        brokerOptions: { ...brokerOptions, nodeID: serviceUUID }
    };

    const { typeDefs, resolvers } = await loadNode({
        name: this.name,
        typeDefs: this.typeDefs,
        resolvers: this.resolvers,
        injections: this.injections
    });

    RUNTIME.introspection = {
        name: this.name,
        typeDefs,
        resolvers: Object.entries(resolvers).reduce(
            (result, [name, methods]) => ({
                ...result,
                [name]: Object.keys(methods)
            }),
            {}
        ),
        hash: typeDefs,
        nodeID: RUNTIME.serviceUUID
    };

    RUNTIME.broker = createNodeBroker(RUNTIME);

    const INTROSPECTION_CALL = `${brokerOptions.gateway}:introspection`;

    RUNTIME.broker.createService({
        name: this.name,
        actions: {
            [INTROSPECTION_CALL]: handleIntrospection(RUNTIME)
        }
    });

    RUNTIME.broker.createService({
        name: RUNTIME.serviceUUID,
        actions: { abort }
    });

    Object.entries(resolvers).forEach(([key, methods]) =>
        RUNTIME.broker.createService({
            name: `${RUNTIME.serviceUUID}:${key}`,
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
