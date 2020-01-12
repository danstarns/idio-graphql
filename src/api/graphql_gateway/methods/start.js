const util = require("util");
const combineNodes = require("../../combine-nodes.js");
const GraphQLNode = require("../../graphql_node/graphql-node.js");
const IdioError = require("../../idio-error.js");
const IdioEnum = require("../../idio-enum.js");

const sleep = util.promisify(setTimeout);

const createLocalNode = require("./create-local-node.js");
const createLocalEnum = require("./create-local-enum.js");

/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('./validate-config.js').config} config
 */

/**
 * @typedef {Object} Schema
 * @property {string} typeDefs - GraphQL typeDefs.
 * @property {Object} resolvers - GraphQL resolvers.
 * @property {Object} resolvers.Query - GraphQL resolvers.Query.
 * @property {Object} resolvers.Mutation - GraphQL resolvers.Mutation.
 * @property {Object} resolvers.Subscription - GraphQL resolvers.Subscription.
 * @property {Object} schemaDirectives - GraphQL schemaDirectives resolvers.
 * @property {ServiceBroker} broker - Broker.
 */

/**
 * @param {Object} curry
 * @param {config} curry.config
 * @param {ServiceBroker} curry.broker
 */
module.exports = ({ brokerOptions, config, broker }) => {
    /**
     * Builds & orchestrates a schema from multiple sources on the network.
     *
     *
     * @returns Schema
     */

    async function start() {
        let started = false;

        const { services, locals } = config;

        const registeredServices = {
            nodes: [],
            enums: []
        };

        let waitingServices = {
            nodes: [...(services.nodes || [])],
            enums: [...(services.enums || [])]
        };

        const resolveNodeIntrospection = (introspection) => {
            if (
                registeredServices.nodes
                    .map((x) => x.name)
                    .includes(introspection.name)
            ) {
                throw new IdioError(
                    `Gateway: '${broker.nodeID}' already has a registered service called: '${introspection.name}'`
                );
            }

            if (waitingServices.nodes.includes(introspection.name)) {
                waitingServices.nodes = waitingServices.nodes.filter(
                    (x) => x !== introspection.name
                );
            }

            if (locals.nodes) {
                locals.nodes.forEach((node) => {
                    if (node.name === introspection.name) {
                        throw new IdioError(
                            `Gateway receiving a introspection request from node: '${introspection}' that is registered as a local node.`
                        );
                    }
                });
            }

            registeredServices.nodes.push(introspection);
        };

        const resolveEnumIntrospection = (introspection) => {
            if (
                registeredServices.enums
                    .map((x) => x.name)
                    .includes(introspection.name)
            ) {
                throw new IdioError(
                    `Gateway: '${broker.nodeID}' already has a registered service called: '${introspection.name}'`
                );
            }

            if (waitingServices.enums.includes(introspection.name)) {
                waitingServices.enums = waitingServices.enums.filter(
                    (x) => x !== introspection.name
                );
            }

            registeredServices.enums.push(introspection);
        };

        const introspectionCall = async (service, type) => {
            let introspection;

            try {
                introspection = await broker.call(`${service}.introspection`, {
                    gateway: broker.nodeID
                });
            } catch (error) {
                return;
            }

            if (type === "node") {
                resolveNodeIntrospection(introspection);
            }
            if (type === "enum") {
                resolveEnumIntrospection(introspection);
            }
        };

        broker.createService({
            name: broker.nodeID,
            events: {
                "introspection.request": async ({ type }, service) => {
                    if (!started) {
                        await introspectionCall(service, type);
                    }
                },
                "gateway.broadcast": async (payload, service) => {
                    if (service !== broker.nodeID) {
                        await broker.emit("gateway.throw", {
                            reason: `one gateway per network.`
                        });
                    }
                },
                "gateway.throw": ({ reason } = {}, sender) => {
                    if (sender !== broker.nodeID) {
                        console.error(
                            new IdioError(
                                `Received request to shutdown from sender: '${sender}'. Reason: ${reason}`
                            )
                        );

                        process.exit(1);
                    }
                }
            }
        });

        await broker.start();

        if (locals.nodes) {
            await Promise.all(
                locals.nodes.map((_node) => _node.serve(brokerOptions))
            );
        }

        if (locals.enums) {
            await Promise.all(
                locals.enums.map((_enum) => _enum.serve(brokerOptions))
            );
        }

        await broker.emit("gateway.broadcast");

        const checkForServices = async (resolve, reject) => {
            if (waitingServices.nodes.length) {
                broker.logger.info(
                    `Waiting for nodes services: [${waitingServices.nodes.join(
                        ", "
                    )}]`
                );

                await sleep(2000);

                await Promise.all(
                    waitingServices.nodes.map((_node) =>
                        introspectionCall(_node, {
                            type: "node"
                        })
                    )
                );

                return setImmediate(checkForServices, resolve, reject);
            }

            if (waitingServices.enums.length) {
                broker.logger.info(
                    `Waiting for enums services: [${waitingServices.enums.join(
                        ", "
                    )}]`
                );

                await sleep(2000);

                await Promise.all(
                    waitingServices.enums.map((_enum) =>
                        introspectionCall(_enum, {
                            type: "enum"
                        })
                    )
                );

                return setImmediate(checkForServices, resolve, reject);
            }

            return resolve();
        };

        await new Promise(checkForServices);

        let nodes = registeredServices.nodes.map(
            createLocalNode({ broker, GraphQLNode })
        );

        const appliances = { ...locals };

        if (registeredServices.enums.length) {
            appliances.enums = registeredServices.enums.map(
                createLocalEnum({ IdioEnum })
            );
        }

        const result = await combineNodes(nodes, appliances);

        started = true;

        return Object.freeze({ ...result, broker });
    }

    return start;
};
