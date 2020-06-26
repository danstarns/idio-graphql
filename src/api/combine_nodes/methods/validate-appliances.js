const { checkInstance } = require("../../../util/index.js");
const APPLIANCE_METADATA = require("../../../constants/appliance-metadata.js");

/**
 * @typedef {import('../combine-nodes.js').appliances} appliances
 * @typedef {import('../combine-nodes.js').RUNTIME} RUNTIME
 */

/**
 * @param {appliances} appliances
 * @param {RUNTIME} RUNTIME
 */
function validateAppliances(appliances, RUNTIME) {
    if (!(typeof appliances === "object")) {
        throw new Error("expected appliances to be of type object");
    }

    Object.entries(appliances)
        .filter(([key]) =>
            APPLIANCE_METADATA.map(({ name }) => name)
                .filter((name) => name !== "schemaGlobals")
                .includes(key)
        )
        .forEach(([key, values]) => {
            const metadata = APPLIANCE_METADATA.find(
                ({ name }) => name === key
            );

            if (!Array.isArray(values)) {
                throw new Error(`expected '${key}' to be an array`);
            }

            values.forEach((value) => {
                checkInstance({
                    instance: value,
                    of: metadata._Constructor,
                    name: metadata.singular
                });

                if (RUNTIME.REGISTERED_NAMES[value.name]) {
                    throw new Error(
                        `${metadata._Constructor.name} with a name: '${value.name}' already registered.`
                    );
                }

                RUNTIME.REGISTERED_NAMES[value.name] = 1;
            });
        });
}

module.exports = validateAppliances;
