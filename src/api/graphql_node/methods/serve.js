const util = require("util");
const CONTEXT_INDEX = require("../../../constants/context-index.js");
const loadNode = require("./load-node.js");
const { iteratorToStream } = require("../../../util/index.js");
const createNodeBroker = require("./create-node-broker.js");
const execute = require("./execute.js");

const sleep = util.promisify(setTimeout);

/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('./create-node-broker.js').IdioBroker} IdioBroker
 */

/**
 * @typedef {import('graphql').DocumentNode} DocumentNode
 * @typedef {import('graphql').ExecutionResult} ExecutionResult
 */

module.exports = (GraphQLNode) => {
    /**
     * @returns {Promise.<ServiceBroker>}
     */
    return async function serve(/** @type {IdioBroker} */ brokerOptions) {
        this.name;
        this.typeDefs;
        this.resolvers;
        this.nodes;
        this.injections;
        this.enums;
        this.interfaces;
        this.unions;
        this.serve;

        let initialized = false;

        const node = new GraphQLNode({
            name: this.name,
            typeDefs: await this.typeDefs(),
            resolvers: this.resolvers,
            injections: this.injections,
            nodes: this.nodes,
            enums: this.enums,
            unions: this.unions,
            interfaces: this.interfaces
        });

        const INTERNALS = {
            REGISTERED_NAMES: {}
        };

        const { typeDefs, resolvers } = await loadNode(node, { INTERNALS });

        this.typeDefs = typeDefs;

        ["Query", "Mutation", "Subscription", "Fields"].forEach((type) => {
            this.resolvers[type] = { ...(resolvers[type] || {}) };
        });

        const introspection = {
            name: this.name,
            typeDefs: this.typeDefs,
            resolvers: Object.entries(this.resolvers).reduce(
                (result, [name, methods]) => ({
                    ...result,
                    [name]: Object.keys(methods)
                }),
                {}
            )
        };

        const broker = createNodeBroker({
            ...brokerOptions,
            nodeID: this.name
        });

        broker.createService({
            name: this.name,
            actions: {
                introspection: () => {
                    initialized = true;

                    return introspection;
                }
            }
        });

        Object.entries(this.resolvers).forEach(([key, methods]) =>
            broker.createService({
                name: `${this.name}:${key}`,
                actions: Object.entries(methods).reduce(
                    (result, [name, method]) => ({
                        ...result,
                        [name]: (ctx) => {
                            const {
                                params: {
                                    graphQLArgs = JSON.stringify([])
                                } = {}
                            } = ctx;

                            const decodedArgs = JSON.parse(graphQLArgs);

                            const context = decodedArgs[CONTEXT_INDEX];

                            if (!context) {
                                decodedArgs[CONTEXT_INDEX] = {};
                            }

                            decodedArgs[CONTEXT_INDEX].broker = broker;
                            decodedArgs[CONTEXT_INDEX].broker.gql = {
                                execute: execute(broker)
                            };

                            if (method.subscribe) {
                                return iteratorToStream(
                                    method.subscribe(...decodedArgs)
                                );
                            }

                            return method(...decodedArgs);
                        }
                    }),
                    {}
                )
            })
        );

        await Promise.all(
            [this.enums, this.unions, this.interfaces, this.nodes]
                .filter(Boolean)
                .flatMap((appliances) =>
                    appliances.map((appliance) =>
                        appliance.serve(brokerOptions)
                    )
                )
        );

        await broker.start();

        await broker.waitForServices(
            [this.enums, this.unions, this.interfaces, this.nodes]
                .filter(Boolean)
                .flatMap((appliances) =>
                    appliances.map((appliance) => appliance.name)
                )
        );

        // eslint-disable-next-line consistent-return
        const introspectionCall = async (resolve, reject) => {
            try {
                await broker.emit(`introspection.request`, { type: "node" });
            } catch (e) {
                e;
            }

            await sleep(1000);

            if (!initialized) {
                setImmediate(introspectionCall, resolve, reject);
            } else {
                return resolve();
            }
        };

        await new Promise(introspectionCall);

        return broker;
    };
};
