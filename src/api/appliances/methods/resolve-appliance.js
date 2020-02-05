const { mergeTypeDefs, printWithComments } = require("graphql-toolkit");
const { parseTypeDefs, checkInstance } = require("../../../util/index.js");
const validateAppliance = require("./validate-appliance.js");

const IdioError = require("../../idio-error.js");

async function resolveAppliance({
    name,
    appliance,
    applianceConstructor,
    plural,
    kind,
    INTERNALS
}) {
    if (name === "schemaGlobals") {
        if (Array.isArray(appliance)) {
            return {
                typeDefs: printWithComments(
                    mergeTypeDefs(
                        await Promise.all(
                            appliance.map(async (def) => parseTypeDefs(def)())
                        )
                    )
                )
            };
        }

        return { typeDefs: await parseTypeDefs(appliance)() };
    }

    if (!Array.isArray(appliance)) {
        throw new IdioError(`expected '${name}' to be an array.`);
    }

    let typeDefs = [];
    let resolvers = {};

    await Promise.all(
        appliance.map(async (instance) => {
            checkInstance({
                instance,
                of: applianceConstructor,
                name: plural
            });

            if (INTERNALS.REGISTERED_NAMES[instance.name]) {
                throw new IdioError(
                    `loading ${applianceConstructor.name} with a name: '${instance.name}' thats already registered.`
                );
            }

            INTERNALS.REGISTERED_NAMES[instance.name] = 1;

            typeDefs.push(
                await validateAppliance({
                    metadata: {
                        applianceConstructor,
                        kind
                    },
                    appliance: instance
                })
            );

            resolvers[instance.name] = instance.resolver;
        })
    );

    return { typeDefs: printWithComments(mergeTypeDefs(typeDefs)), resolvers };
}

module.exports = resolveAppliance;
