const util = require("util");
const APPLIANCE_METADATA = require("../../../constants/appliance-metadata.js");
const introspectionCall = require("./introspection-call.js");

const sleep = util.promisify(setTimeout);

const applianceMetadata = [
    ...APPLIANCE_METADATA,
    {
        singular: "node",
        name: "nodes"
    }
];

/**
 * @param {import('./start.js').Runtime} RUNTIME
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
                    const { singular } = applianceMetadata.find(
                        ({ name }) => name === key
                    );

                    broker.logger.info(
                        `Waiting for ${singular} services: [${services.join(
                            ", "
                        )}]`
                    );

                    return services.map((service) =>
                        introspectionCall(RUNTIME)(
                            `${service}:${broker.options.nodeID}`,
                            singular
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
