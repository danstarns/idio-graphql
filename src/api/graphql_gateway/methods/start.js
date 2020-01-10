const util = require("util");
const combineNodes = require("../../combine_nodes/combine-nodes.js");
const GraphQLNode = require("../../graphql_node/graphql-node.js");
const IdioError = require("../../idio-error.js");

const sleep = util.promisify(setTimeout);

const createLocalNode = require("./create-local-node.js");

/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('./validate-appliances.js').appliances} appliances
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
 * @param {appliances} curry.appliances
 * @param {ServiceBroker} curry.broker
 */
module.exports = ({ appliances, broker }) => {
    /**
     * Builds & orchestrates a schema from multiple sources on the network.
     *
     *
     * @returns Schema
     */

    async function start() {
        let started = false;

        const registeredServices = [];

        let waitingServices = [...(appliances.dependencies || [])];

        const introspectionCall = async (service) => {
            let introspection;

            try {
                introspection = await broker.call(`${service}.introspection`, {
                    gateway: broker.nodeID
                });
            } catch (error) {
                return;
            }

            if (
                registeredServices
                    .map((x) => x.name)
                    .includes(introspection.name)
            ) {
                throw new IdioError(
                    `Gateway: '${broker.nodeID}' already has a registered service called: '${introspection.name}'`
                );
            }

            if (appliances.dependencies.includes(introspection.name)) {
                waitingServices = waitingServices.filter(
                    (x) => x !== introspection.name
                );
            }

            if (appliances.nodes) {
                appliances.nodes.forEach((node) => {
                    if (node.name === introspection.name) {
                        throw new IdioError(
                            `Gateway receiving a introspection request from node: '${introspection}' that is registered as a local node.`
                        );
                    }
                });
            }

            registeredServices.push(introspection);
        };

        broker.createService({
            name: broker.nodeID,
            events: {
                "introspection.request": async (payload, service) => {
                    if (!started) {
                        await introspectionCall(service);
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

        await broker.emit("gateway.broadcast");

        const checkForServices = async (resolve, reject) => {
            if (waitingServices.length) {
                broker.logger.info(
                    `Waiting for services: [${waitingServices.join(", ")}]`
                );

                await sleep(2000);

                await Promise.all(waitingServices.map(introspectionCall));

                return setImmediate(checkForServices, resolve, reject);
            }

            return resolve();
        };

        await new Promise(checkForServices);

        let nodes = registeredServices.map(
            createLocalNode({ broker, GraphQLNode })
        );

        if (appliances.nodes) {
            nodes = [...nodes, ...appliances.nodes];
        }

        const result = await combineNodes(nodes, { ...appliances });

        started = true;

        return Object.freeze({ ...result, broker });
    }

    return start;
};
