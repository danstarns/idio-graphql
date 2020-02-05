const { mergeTypeDefs, printWithComments } = require("graphql-toolkit");
const { parseTypeDefs, checkInstance } = require("../../../util/index.js");
const validateAppliance = require("./validate-appliance.js");

const IdioError = require("../../idio-error.js");

function resolveAppliance(metadata, INTERNALS) {
    const { name, appliance, applianceConstructor, singular, kind } = metadata;

    if (name === "schemaGlobals") {
        if (Array.isArray(appliance)) {
            return {
                typeDefs: printWithComments(
                    mergeTypeDefs(appliance.map(parseTypeDefs))
                )
            };
        }

        return { typeDefs: parseTypeDefs(appliance) };
    }

    if (!Array.isArray(appliance)) {
        throw new IdioError(`expected '${name}' to be an array.`);
    }

    let typeDefs = [];
    let resolvers = {};

    appliance.forEach((instance) => {
        checkInstance({
            instance,
            of: applianceConstructor,
            name: singular
        });

        if (INTERNALS.REGISTERED_NAMES[instance.name]) {
            throw new IdioError(
                `loading ${applianceConstructor.name} with a name: '${instance.name}' thats already registered.`
            );
        }

        INTERNALS.REGISTERED_NAMES[instance.name] = 1;

        typeDefs.push(
            validateAppliance({
                metadata: {
                    applianceConstructor,
                    kind
                },
                appliance: instance
            })
        );

        resolvers[instance.name] = instance.resolver;
    });

    return { typeDefs: printWithComments(mergeTypeDefs(typeDefs)), resolvers };
}

module.exports = resolveAppliance;
