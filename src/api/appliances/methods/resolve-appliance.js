const { mergeTypeDefs, printWithComments } = require("graphql-toolkit");
const { parse } = require("graphql/language");
const { parseTypeDefs, checkInstance } = require("../../../util/index.js");

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
            const loadedTypeDefs = await Promise.all(
                appliance.map((def) => parseTypeDefs(def)())
            );

            return { typeDefs: mergeTypeDefs(loadedTypeDefs) };
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

            let ast;

            try {
                ast = parse(await instance.typeDefs());
            } catch (error) {
                throw new IdioError(
                    `loading ${applianceConstructor.name} with name: '${instance.name}' could not parse typeDefs \n${error}.`
                );
            }

            const foundDefinition = ast.definitions
                .filter((def) => def.kind === kind)
                .find((def) => def.name.value === instance.name);

            if (!foundDefinition) {
                throw new IdioError(
                    `${applianceConstructor.name} with name: '${instance.name}' should contain a ${kind} called '${instance.name}'.`
                );
            }

            typeDefs.push(ast);

            resolvers[instance.name] = instance.resolver;
        })
    );

    return { typeDefs: printWithComments(mergeTypeDefs(typeDefs)), resolvers };
}

module.exports = resolveAppliance;
