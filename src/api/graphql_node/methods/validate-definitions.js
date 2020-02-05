const { parse } = require("graphql/language");
const IdioError = require("../../idio-error.js");

function validateDefinitions(node) {
    const prefix = `GraphQLNode with name: '${node.name}'`;

    let ast;

    try {
        ast = parse(node.typeDefs);
    } catch (error) {
        throw new IdioError(`${prefix} could not parse typeDefs \n${error}.`);
    }

    const nodeAst = ast.definitions
        .filter(({ kind }) => kind === "ObjectTypeDefinition")
        .find(({ name: { value } }) => value === node.name);

    if (!nodeAst) {
        throw new IdioError(
            `${prefix} should contain a ObjectTypeDefinition called '${node.name}'.`
        );
    }

    const nodeFields = nodeAst.fields.map(({ name }) => name.value);

    Object.keys(node.resolvers.Fields || {}).forEach((key) => {
        if (!nodeFields.includes(key)) {
            throw new IdioError(
                `${prefix} has a Field resolver called '${key}' thats not defined in typeDefs.`
            );
        }
    });

    ["Query", "Mutation", "Subscription"].forEach((type) => {
        const resolvers = {
            SDL: ast.definitions
                .filter(({ kind, name: { value } }) => {
                    if (
                        kind === "ObjectTypeDefinition" ||
                        kind === "ObjectTypeExtension"
                    ) {
                        return value === type;
                    }

                    return false;
                })
                .flatMap(({ fields }) => fields)
                .map(({ name: { value } }) => value),
            JS: Object.keys(node.resolvers[type] || {})
        };

        resolvers.SDL.forEach((field) => {
            if (!resolvers.JS.includes(field)) {
                throw new IdioError(
                    `${prefix} has a ${type} in the typeDefs called '${field}' thats not defined in resolvers.`
                );
            }
        });

        resolvers.JS.forEach((method) => {
            if (!resolvers.SDL.includes(method)) {
                throw new IdioError(
                    `${prefix} has a ${type} resolver called '${method}' thats not defined in typeDefs.`
                );
            }
        });
    });
}

module.exports = validateDefinitions;
