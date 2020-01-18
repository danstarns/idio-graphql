const util = require("util");
const CONTEXT_INDEX = require("../../../constants/context-index.js");
const IdioError = require("../../idio-error.js");
const loadNode = require("./load-node.js");
const { iteratorToStream } = require("../../../util/index.js");

const sleep = util.promisify(setTimeout);

/**
 * @typedef {import('moleculer').BrokerOptions} BrokerOptions
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 */

module.exports = (GraphQLNode) => {
    /**
     * @returns {Promise.<ServiceBroker>}
     */
    return async function serve(/** @type {BrokerOptions} */ brokerOptions) {
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

        if (!brokerOptions) {
            throw new IdioError("brokerOptions required.");
        }

        if (!brokerOptions.transporter) {
            throw new IdioError("brokerOptions.transporter required.");
        }

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

        let moleculer = {};

        try {
            // eslint-disable-next-line global-require
            moleculer = require("moleculer");
        } catch (error) {
            throw new IdioError(
                `Cant find module: 'moleculer' install using npm install --save moleculer`
            );
        }

        const { ServiceBroker } = moleculer;

        /** @type {ServiceBroker} */
        const broker = new ServiceBroker({
            ...brokerOptions,
            nodeID: this.name
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
                    (result, [name, method]) => {
                        if (method.subscribe) {
                            return {
                                ...result,
                                [name]: (ctx) => {
                                    const {
                                        params: { graphQLArgs = [] } = {}
                                    } = ctx;

                                    graphQLArgs[CONTEXT_INDEX].broker = broker;

                                    return iteratorToStream(
                                        method.subscribe(...graphQLArgs)
                                    );
                                }
                            };
                        }

                        return {
                            ...result,
                            [name]: (ctx) => {
                                const {
                                    params: { graphQLArgs = [] } = {}
                                } = ctx;

                                graphQLArgs[CONTEXT_INDEX].broker = broker;

                                return method(...graphQLArgs);
                            }
                        };
                    },
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
