const { ServicesManager } = require("../../../util/index.js");
const APPLIANCE_METADATA = require("../../../constants/appliance-metadata.js");
const GraphQLNode = require("../../graphql_node/graphql-node.js");

const applianceMetadata = [
    ...APPLIANCE_METADATA,
    {
        _Constructor: GraphQLNode,
        kind: "ObjectTypeDefinition",
        singular: "node",
        name: "nodes"
    }
];

/**
 * @typedef {import('../graphql-gateway.js').Runtime} Runtime
 */

/**
 * @param {Runtime} RUNTIME
 */
module.exports = (RUNTIME) => {
    const { broker } = RUNTIME;

    return async function introspectionCall(service, type) {
        /**
         * @typedef introspection
         * @param {string} name
         * @param {string} typeDefs
         * @param {Object} resolvers
         * @param {string} hash
         */
        let introspection;

        const [serviceName, gateway] = service.split(":");

        const INTROSPECTION_CALL = `${serviceName}.${gateway}:introspection`;

        try {
            const introspectionBody = {
                gateway: broker.options.nodeID,
                hash: broker.options.nodeID
            };

            introspection = await broker.call(
                INTROSPECTION_CALL,
                introspectionBody
            );

            if (!introspection) {
                return;
            }
        } catch (error) {
            return;
        }

        if (!RUNTIME.serviceManagers[type][serviceName]) {
            RUNTIME.serviceManagers[type][serviceName] = new ServicesManager(
                service,
                {
                    broker,
                    hash: introspection.hash
                }
            );

            const { name } = applianceMetadata.find(
                ({ singular }) => singular === type
            );

            if (RUNTIME.waitingServices[name].includes(introspection.name)) {
                RUNTIME.waitingServices[name] = RUNTIME.waitingServices[
                    name
                ].filter((x) => x !== introspection.name);
            }

            RUNTIME.registeredServices[name].push(introspection);
        }

        RUNTIME.serviceManagers[type][serviceName].push(service);
    };
};
