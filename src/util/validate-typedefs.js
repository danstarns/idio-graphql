const { parse } = require("graphql/language");
const { printWithComments } = require("graphql-toolkit");
const IdioError = require("../api/idio-error.js");

function validateTypeDefs(appliance, metadata) {
    let ast;

    try {
        ast = parse(appliance.typeDefs);
    } catch (error) {
        throw new IdioError(
            `${metadata._Constructor.name} with name: '${appliance.name}' could not parse typeDefs \n${error}.`
        );
    }

    const foundDefinition = ast.definitions
        .filter((def) => def.kind === metadata.kind)
        .find((def) => def.name.value === appliance.name);

    if (!foundDefinition) {
        throw new IdioError(
            `${metadata._Constructor.name} with name: '${appliance.name}' should contain a ${metadata.kind} called '${appliance.name}'.`
        );
    }

    return printWithComments(ast);
}

module.exports = validateTypeDefs;
