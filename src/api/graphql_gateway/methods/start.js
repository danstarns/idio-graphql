const util = require("util");
const { graphql } = require("graphql");
const { makeExecutableSchema } = require("graphql-tools");
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

        let schema;

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

            const { name } = [
                ...APPLIANCE_METADATA,
                {
                    applianceConstructor: GraphQLNode,
                    kind: "ObjectTypeDefinition",
                    plural: "node",
                    name: "nodes"
                }
            ].find((x) => x.plural === type);

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

            registeredServices[name].push(introspection);
        };

        const checkForServices = async (resolve, reject) => {
            const waiting = Object.entries(
                waitingServices
            ).filter(([, _services]) => Boolean(_services.length));

            if (waiting.length) {
                await Promise.all(
                    waiting.flatMap(async ([key, _services]) => {
                        const { plural } = [
                            ...APPLIANCE_METADATA,
                            {
                                applianceConstructor: GraphQLNode,
                                kind: "ObjectTypeDefinition",
                                plural: "node",
                                name: "nodes"
                            }
                        ].find((x) => x.name === key);

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

        broker.createService({
            name: broker.nodeID,
            events: {
                "introspection.request": async ({ type }, service) => {
                    if (!started) {
                        await introspectionCall(service, type);
                    }
                }
            },
            actions: {
                execute: ({
                    params: {
                        operationName,
                        document,
                        variables,
                        context,
                        root
                    }
                }) =>
                    graphql({
                        schema,
                        source: document,
                        rootValue: root,
                        contextValue: context,
                        variableValues: variables,
                        operationName
                    })
            }
        });

        await broker.start();

        await Promise.all(
            Object.entries(locals)
                .filter(
                    ([name]) =>
                        !["scalars", "directives", "schemaGlobals"].includes(
                            name
                        )
                )
                .flatMap(([, value]) => value)
                .map((local) => local.serve(brokerOptions))
        );

        await broker.emit("gateway.broadcast");

        await new Promise(checkForServices);

        let nodes = registeredServices.nodes.map(
            createLocalNode({ broker, GraphQLNode })
        );

        const appliances = {
            scalars: locals.scalars || [],
            directives: locals.directives || [],
            schemaGlobals: locals.schemaGlobals,
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

        const { typeDefs, resolvers, schemaDirectives } = await combineNodes(
            nodes,
            appliances
        );

        schema = makeExecutableSchema({
            typeDefs,
            resolvers,
            schemaDirectives
        });

        started = true;

        return { typeDefs, resolvers, schemaDirectives, schema, broker };
    }

    return start;
};
