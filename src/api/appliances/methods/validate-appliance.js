const { parse } = require("graphql/language");
const { printWithComments } = require("graphql-toolkit");
const IdioError = require("../../idio-error.js");

async function validateAppliance(RUNTIME) {
    const {
        metadata: { applianceConstructor, kind },
        appliance
    } = RUNTIME;

    let ast;

    try {
        ast = parse(await appliance.typeDefs());
    } catch (error) {
        throw new IdioError(
            `Serving ${applianceConstructor.name} with name: '${appliance.name}' could not parse typeDefs \n${error}.`
        );
    }

    const foundDefinition = ast.definitions
        .filter((def) => def.kind === kind)
        .find((def) => def.name.value === appliance.name);

    if (!foundDefinition) {
        throw new IdioError(
            `${applianceConstructor.name} with name: '${appliance.name}' should contain a ${kind} called '${appliance.name}'.`
        );
    }

    return printWithComments(ast);
}

module.exports = validateAppliance;
