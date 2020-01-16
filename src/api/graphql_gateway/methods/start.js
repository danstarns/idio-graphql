const util = require("util");
const combineNodes = require("../../combine-nodes.js");
const GraphQLNode = require("../../graphql_node/graphql-node.js");
const IdioError = require("../../idio-error.js");

const sleep = util.promisify(setTimeout);

const { createLocalNode } = require("../../graphql_node/methods/index.js");
const { createLocalAppliance } = require("../../appliances/methods/index.js");

/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').BrokerOptions} BrokerOptions
 * @typedef {import('./create-config.js').config} config
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
 * @param {BrokerOptions} curry.brokerOptions
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
            enums: [],
            interfaces: [],
            unions: []
        };

        let waitingServices = {
            nodes: [...(services.nodes || [])],
            enums: [...(services.enums || [])],
            interfaces: [...(services.interfaces || [])],
            unions: [...(services.unions || [])]
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
                if (
                    registeredServices.nodes
                        .map((x) => x.name)
                        .includes(introspection.name)
                ) {
                    throw new IdioError(
                        `Gateway: '${broker.nodeID}' already has a registered node service called: '${introspection.name}'.`
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
            } else if (type === "enum") {
                if (
                    registeredServices.enums
                        .map((x) => x.name)
                        .includes(introspection.name)
                ) {
                    throw new IdioError(
                        `Gateway: '${broker.nodeID}' already has a registered enum service called: '${introspection.name}'.`
                    );
                }

                if (waitingServices.enums.includes(introspection.name)) {
                    waitingServices.enums = waitingServices.enums.filter(
                        (x) => x !== introspection.name
                    );
                }

                registeredServices.enums.push(introspection);
            } else if (type === "union") {
                if (
                    registeredServices.unions
                        .map((x) => x.name)
                        .includes(introspection.name)
                ) {
                    throw new IdioError(
                        `Gateway: '${broker.nodeID}' already has a registered union service called: '${introspection.name}'.`
                    );
                }

                if (waitingServices.unions.includes(introspection.name)) {
                    waitingServices.unions = waitingServices.unions.filter(
                        (x) => x !== introspection.name
                    );
                }

                registeredServices.unions.push(introspection);
            } else if (type === "interface") {
                if (
                    registeredServices.interfaces
                        .map((x) => x.name)
                        .includes(introspection.name)
                ) {
                    throw new IdioError(
                        `Gateway: '${broker.nodeID}' already has a registered interface service called: '${introspection.name}'.`
                    );
                }

                if (waitingServices.interfaces.includes(introspection.name)) {
                    waitingServices.interfaces = waitingServices.interfaces.filter(
                        (x) => x !== introspection.name
                    );
                }

                registeredServices.interfaces.push(introspection);
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
                            reason: `One gateway per network.`
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

        await Promise.all(
            [
                ...(locals.nodes || []),
                ...(locals.enums || []),
                ...(locals.unions || []),
                ...(locals.interfaces || [])
            ].map((local) => local.serve(brokerOptions))
        );

        await broker.emit("gateway.broadcast");

        const checkForServices = async (resolve, reject) => {
            if (
                waitingServices.nodes.length > 0 ||
                waitingServices.enums.length > 0 ||
                waitingServices.unions.length > 0 ||
                waitingServices.interfaces.length > 0
            ) {
                await sleep(1000);

                if (waitingServices.nodes.length) {
                    broker.logger.info(
                        `Waiting for node services: [${waitingServices.nodes.join(
                            ", "
                        )}]`
                    );

                    await Promise.all(
                        waitingServices.nodes.map((_node) => {
                            return introspectionCall(_node, "node");
                        })
                    );
                }

                if (waitingServices.enums.length) {
                    broker.logger.info(
                        `Waiting for enum services: [${waitingServices.enums.join(
                            ", "
                        )}]`
                    );

                    await Promise.all(
                        waitingServices.enums.map((_enum) =>
                            introspectionCall(_enum, "enum")
                        )
                    );
                }

                if (waitingServices.unions.length) {
                    broker.logger.info(
                        `Waiting for union services: [${waitingServices.unions.join(
                            ", "
                        )}]`
                    );

                    await Promise.all(
                        waitingServices.unions.map((_union) =>
                            introspectionCall(_union, "union")
                        )
                    );
                }

                if (waitingServices.interfaces.length) {
                    broker.logger.info(
                        `Waiting for interface services: [${waitingServices.interfaces.join(
                            ", "
                        )}]`
                    );

                    await Promise.all(
                        waitingServices.interfaces.map((_interface) =>
                            introspectionCall(_interface, "interface")
                        )
                    );
                }

                setImmediate(checkForServices, resolve, reject);
            } else {
                return resolve();
            }
        };

        await new Promise(checkForServices);

        let nodes = registeredServices.nodes.map(
            createLocalNode({ broker, GraphQLNode })
        );

        const appliances = {
            ...locals,
            ...Object.entries(registeredServices)
                .filter(([key]) => key !== "nodes")
                .reduce(
                    (result, [key, values]) => ({
                        ...result,
                        [key]: values.map(
                            createLocalAppliance({
                                type: key,
                                broker
                            })
                        )
                    }),
                    {}
                )
        };

        const result = await combineNodes(nodes, appliances);

        started = true;

        return Object.freeze({ ...result, broker });
    }

    return start;
};
