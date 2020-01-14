const util = require("util");
const CONTEXT_INDEX = require("../../../constants/context-index.js");
const IdioError = require("../../idio-error.js");
const loadNode = require("./load-node.js");
const { iteratorToStream } = require("../../../util/index.js");

const sleep = util.promisify(setTimeout);

module.exports = (GraphQLNode) => {
    return async function serve(brokerOptions = {}) {
        this.name;
        this.typeDefs;
        this.resolvers;
        this.enums;
        this.nodes;
        this.injections;

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
            injections: this.injections
        });

        const { typeDefs, resolvers } = await loadNode(node, {
            REGISTERED_NAMES: {}
        });

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
                `Cant find module: 'moleculer' install using npm install --save moleculer `
            );
        }

        const { ServiceBroker } = moleculer;

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
                introspection: ({ params: { gateway } = {} } = {}) => {
                    initialized = true;

                    broker.logger.info(
                        `Connected to GraphQLGateway: '${gateway}'`
                    );

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
                                    ctx.params.graphQLArgs[
                                        CONTEXT_INDEX
                                    ].broker = broker;

                                    return iteratorToStream(
                                        method.subscribe(
                                            ...ctx.params.graphQLArgs
                                        )
                                    );
                                }
                            };
                        }

                        return {
                            ...result,
                            [name]: (ctx) => {
                                ctx.params.graphQLArgs[
                                    CONTEXT_INDEX
                                ].broker = broker;

                                return method(...ctx.params.graphQLArgs);
                            }
                        };
                    },
                    {}
                )
            })
        );

        if (this.enums && this.enums.length) {
            await Promise.all(
                this.enums.map((_enum) => _enum.serve(brokerOptions))
            );
        }

        if (this.nodes && this.nodes.length) {
            await Promise.all(this.nodes.map((n) => n.serve(brokerOptions)));
        }

        await broker.start();

        if (this.enums && this.enums.length) {
            await broker.waitForServices(this.enums.map((_enum) => _enum.name));
        }

        if (this.nodes && this.nodes.length) {
            await broker.waitForServices(this.nodes.map((n) => n.name));
        }

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
