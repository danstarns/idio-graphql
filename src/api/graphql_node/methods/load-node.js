/* eslint-disable no-restricted-syntax */
const { parse } = require("graphql/language");
const { wrappedResolver, isFunction } = require("../../../util/index.js");
const IdioError = require("../../idio-error.js");
const resolveAppliance = require("../../appliances/methods/resolve-appliance.js");
const APPLIANCE_METADATA = require("../../../constants/appliance-metadata.js");
const CONTEXT_INDEX = require("../../../constants/context-index.js");

/**
 * @param {GraphQLNode} n
 */
async function loadNode(n, { INTERNALS }) {
    const node = { ...n };

    const prefix = `GraphQLNode with name: '${node.name}'`;

    node.typeDefs = await node.typeDefs();

    try {
        if (isFunction(node.injections)) {
            node.injections = await node.injections();
        }
    } catch (error) {
        throw new IdioError(`${prefix} failed executing injections\n${error}`);
    }

    await Promise.all(
        Object.entries({
            enums: node.enums,
            interfaces: node.interfaces,
            unions: node.unions
        })
            .filter(([, value]) => Boolean(value))
            .map(async ([key, values]) => {
                const metadata = APPLIANCE_METADATA.find(
                    ({ name }) => name === key
                );

                const resolvedAppliance = await resolveAppliance({
                    ...metadata,
                    appliance: values,
                    INTERNALS
                });

                node.typeDefs += `\n${resolvedAppliance.typeDefs}\n`;

                node[`${metadata.plural}Resolvers`] =
                    resolvedAppliance.resolvers;
            })
    );

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

    node.resolvers = ["Query", "Mutation", "Subscription", "Fields"].reduce(
        (resolvers, type) => {
            const methods = node.resolvers[type];

            if (methods) {
                Object.keys(methods).forEach((name) => {
                    const method = methods[name];

                    resolvers[type] = {};

                    if (isFunction(method)) {
                        resolvers[type][name] = wrappedResolver(method, {
                            name: `${node.name}.resolvers.${type}.${name}`,
                            injections: node.injections
                        });

                        return;
                    }

                    if (Object.keys(method).includes("subscribe")) {
                        resolvers[type][name] = {
                            ...method,
                            async *subscribe(...graphQLArgs) {
                                try {
                                    if (!graphQLArgs[CONTEXT_INDEX]) {
                                        graphQLArgs[CONTEXT_INDEX] = {};
                                    }

                                    graphQLArgs[CONTEXT_INDEX].injections = {
                                        ...(graphQLArgs[CONTEXT_INDEX]
                                            .injections || {}),
                                        ...(node.injections || {})
                                    };

                                    const iterator = await method.subscribe(
                                        ...graphQLArgs
                                    );

                                    for await (const chunk of iterator) {
                                        yield chunk;
                                    }
                                } catch (error) {
                                    throw new IdioError(
                                        `${prefix} resolvers.${type}.${name} failed:\n${error}`
                                    );
                                }
                            }
                        };

                        return;
                    }

                    if (Object.keys(method).includes("resolve")) {
                        const { pre, resolve, post } = method;

                        resolvers[type][name] = wrappedResolver(resolve, {
                            pre,
                            post,
                            name: `${node.name}.resolvers.${type}.${name}`,
                            injections: node.injections
                        });

                        return;
                    }

                    throw new IdioError(
                        `${prefix} has resolver.${type}.${name} that requires a 'resolve' method.`
                    );
                });
            }

            return resolvers;
        },
        {}
    );

    if (node.nodes) {
        node.nodes = await Promise.all(
            node.nodes.map((_node) => loadNode(_node, { INTERNALS }))
        );
    }

    return node;
}

module.exports = loadNode;
