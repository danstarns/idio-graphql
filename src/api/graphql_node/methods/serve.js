const util = require("util");
const { print } = require("graphql/language/printer");
const { parse } = require("graphql/language/parser");
const CONTEXT_INDEX = require("../../../constants/context-index.js");
const IdioError = require("../../idio-error.js");
const loadNode = require("./load-node.js");
const { iteratorToStream } = require("../../../util/index.js");

const sleep = util.promisify(setTimeout);

/**
 * @typedef {import('moleculer').BrokerOptions} BrokerOptions
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 *
 *
 *
 * @typedef {import('graphql').DocumentNode} DocumentNode
 * @typedef {import('graphql').ExecutionResult} ExecutionResult
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

        /**
         * @typedef ExecutionContext
         * @property {Object} root
         * @property {Object} context
         * @property {Object} variables
         * @property {string} operationName
         */

        /**
         *
         * @param {(DocumentNode|string)} document
         * @param {ExecutionContext} executionContext
         *
         * @returns {Promise.<ExecutionResult>}
         */
        function execute(document, executionContext = {}) {
            const {
                root,
                context,
                variables,
                operationName
            } = executionContext;

            try {
                if (!document) {
                    throw new IdioError(`document required`);
                }

                const queryType = typeof document;

                if (queryType !== "object" && queryType !== "string") {
                    throw new IdioError(
                        `execute must provide document string or AST.`
                    );
                }

                if (queryType === "string") {
                    document = parse(document);
                }

                const { kind } = document;

                if (kind) {
                    const { definitions = [] } = document;

                    if (
                        definitions.find((x) => x.operation === "subscription")
                    ) {
                        throw new IdioError(
                            "subscriptions not supported with interservice communication."
                        );
                    }
                } else {
                    throw new IdioError(`Invalid document provided.`);
                }

                return broker.call("gateway.execute", {
                    document: print(document),
                    variables,
                    operationName,
                    context,
                    root
                });
            } catch (error) {
                throw new IdioError(
                    `Failed executing inter-service query, Error:\n${error}`
                );
            }
        }

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
                                execute
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
