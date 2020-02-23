const { parse } = require("graphql/language");
const IdioError = require("../../idio-error.js");

/** @typedef {import('../graphql-node.js').GraphQLNode} GraphQLNode */

/**
 * @param {GraphQLNode} node
 */
function validateDefinitions(node) {
    const prefix = `GraphQLNode with name: '${node.name}'`;

    const typeOfResolvers = typeof node.resolvers;

    if (typeOfResolvers !== "object") {
        throw new IdioError(
            `${prefix} expected node resolvers to be of type 'object' but received '${typeOfResolvers}'.`
        );
    }

    if (!Object.keys(node.resolvers).length) {
        throw new IdioError(
            `${prefix} at least one resolver required. Consider using 'schemaGlobals' if '${node.name}' does not require a resolver.`
        );
    }

    const allowedResolvers = ["Query", "Mutation", "Subscription", "Fields"];

    const notAllowedResolvers = Object.keys(node.resolvers).filter(
        (key) => !allowedResolvers.includes(key)
    );

    if (notAllowedResolvers.length) {
        throw new IdioError(
            `${prefix} invalid resolvers '[ ${notAllowedResolvers} ]'.`
        );
    }

    if (node.resolvers.Subscription) {
        Object.entries(node.resolvers.Subscription).forEach(
            ([key, resolver]) => {
                if (!resolver.subscribe) {
                    throw new IdioError(
                        `${prefix} resolvers.Subscription.${key} must contain a subscribe method.`
                    );
                }
            }
        );
    }

    let ast;

    try {
        ast = parse(node.typeDefs);
    } catch (error) {
        throw new IdioError(`${prefix} could not parse typeDefs \n${error}.`);
    }

    const nodeAst = ast.definitions
        .filter(({ kind }) => kind === "ObjectTypeDefinition")
        .find(({ name: { value } }) => value === node.name);

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

            JS: Object.keys(
                node.resolvers[type] || /* istanbul ignore next */ {}
            )
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
