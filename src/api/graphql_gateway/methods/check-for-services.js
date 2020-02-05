const util = require("util");
const APPLIANCE_METADATA = require("../../../constants/appliance-metadata.js");
const introspectionCall = require("./introspection-call.js");
const GraphQLNode = require("../../graphql_node/graphql-node.js");

const sleep = util.promisify(setTimeout);

const applianceMetadata = [
    ...APPLIANCE_METADATA,
    {
        applianceConstructor: GraphQLNode,
        kind: "ObjectTypeDefinition",
        plural: "node",
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

    return async function checkForServices(resolve, reject) {
        const waiting = Object.entries(
            RUNTIME.waitingServices
        ).filter(([, services]) => Boolean(services.length));

        if (waiting.length) {
            await Promise.all(
                waiting.flatMap(async ([key, services]) => {
                    const { plural } = applianceMetadata.find(
                        ({ name }) => name === key
                    );

                    broker.logger.info(
                        `Waiting for ${plural} services: [${services.join(
                            ", "
                        )}]`
                    );

                    return services.map((service) =>
                        introspectionCall(RUNTIME)(
                            `${service}:${broker.options.nodeID}`,
                            plural
                        )
                    );
                })
            );

            await sleep(1000);

            setImmediate(checkForServices, resolve, reject);
        } else {
            return resolve();
        }
    };
};
