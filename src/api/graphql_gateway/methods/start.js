const util = require("util");
const combineNodes = require("../../combine-nodes.js");
const GraphQLNode = require("../../graphql_node/graphql-node.js");
const IdioError = require("../../idio-error.js");
const APPLIANCE_METADATA = require("../../../constants/appliance-metadata.js");

const sleep = util.promisify(setTimeout);

const { createLocalNode } = require("../../graphql_node/methods/index.js");
const { createLocalAppliance } = require("../../appliances/methods/index.js");

/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').BrokerOptions} BrokerOptions
 * @typedef {import('../graphql-gateway.js').config} config
 * @typedef {import('../graphql-gateway.js').Schema} Schema
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
     * @returns {Schema}
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
                introspection = await broker.call(`${service}.introspection`);
            } catch (error) {
                return;
            }

            const { name } = APPLIANCE_METADATA.find((x) => x.plural === type);

            if (
                registeredServices[name]
                    .map((x) => x.name)
                    .includes(introspection.name)
            ) {
                throw new IdioError(
                    `Gateway: '${broker.nodeID}' already has a registered ${type} service called: '${introspection.name}'.`
                );
            }

            if (waitingServices[name].includes(introspection.name)) {
                waitingServices[name] = waitingServices[name].filter(
                    (x) => x !== introspection.name
                );
            }

            if (locals[name]) {
                locals[name].forEach((node) => {
                    if (node.name === introspection.name) {
                        throw new IdioError(
                            `Gateway receiving a introspection request from ${type}: '${introspection}' that is registered as a local ${type}.`
                        );
                    }
                });
            }

            registeredServices[name].push(introspection);
        };

        broker.createService({
            name: broker.nodeID,
            events: {
                "introspection.request": async ({ type }, service) => {
                    if (!started) {
                        await introspectionCall(service, type);
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
            const waiting = Object.entries(
                waitingServices
            ).filter(([, _services]) => Boolean(_services.length));

            if (waiting.length) {
                await Promise.all(
                    waiting.flatMap(async ([key, _services]) => {
                        const { plural } = APPLIANCE_METADATA.find(
                            (x) => x.name === key
                        );

                        broker.logger.info(
                            `Waiting for ${plural} services: [ ${_services.join(
                                ", "
                            )} ]`
                        );

                        return _services.map((service) =>
                            introspectionCall(service, plural)
                        );
                    })
                );

                await sleep(1000);

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

        return { ...result, broker };
    }

    return start;
};
