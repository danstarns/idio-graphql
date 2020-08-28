const { parse } = require("graphql/language");
const { printWithComments } = require("@graphql-tools/merge");

function validateTypeDefs(instance, metadata) {
    let ast;

    try {
        ast = parse(instance.typeDefs);
    } catch (error) {
        throw new Error(
            `${metadata._Constructor.name} with name: '${instance.name}' could not parse typeDefs \n${error}.`
        );
    }

    const foundDefinition = ast.definitions
        .filter((def) => def.kind === metadata.kind)
        .find((def) => def.name.value === instance.name);

    if (!foundDefinition) {
        throw new Error(
            `${metadata._Constructor.name} with name: '${instance.name}' should contain a ${metadata.kind} called '${instance.name}'.`
        );
    }

    return printWithComments(ast);
}

module.exports = validateTypeDefs;
