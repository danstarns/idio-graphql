const { parse } = require("graphql/language");
const { wrappedResolver, isFunction } = require("../util/index.js");
const IdioError = require("../idio-error.js");
const resolveAppliance = require("./resolve-appliance.js");
const APPLIANCE_METADATA = require("../constants/appliance-metadata.js");

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

    if (node.enums) {
        const loadedEnums = await resolveAppliance({
            ...APPLIANCE_METADATA.find(({ name }) => name === "enums"),
            appliance: node.enums,
            INTERNALS
        });

        node.typeDefs += `\n${loadedEnums.typeDefs}\n`;

        node.enumResolvers = loadedEnums.resolvers;
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
                            subscribe: wrappedResolver(method.subscribe, {
                                pre: method.pre,
                                post: method.post,
                                name: `${node.name}.resolvers.${type}.${name}`,
                                injections: node.injections
                            })
                        };

                        return;
                    }

                    if (Object.keys(method).includes("resolve")) {
                        if (Object.keys(method.resolve).includes("subscribe")) {
                            resolvers[type][name] = {
                                ...method.resolve,
                                subscribe: wrappedResolver(
                                    method.resolve.subscribe,
                                    {
                                        pre: method.pre,
                                        post: method.post,
                                        name: `${node.name}.resolvers.${type}.${name}`,
                                        injections: node.injections
                                    }
                                )
                            };

                            return;
                        }

                        resolvers[type][name] = wrappedResolver(
                            method.resolve,
                            {
                                pre: method.pre,
                                post: method.post,
                                name: `${node.name}.resolvers.${type}.${name}`,
                                injections: node.injections
                            }
                        );

                        return;
                    }

                    throw new IdioError(
                        `${prefix} has resolver.${type}.${name} that requires a 'resolve' method`
                    );
                });
            }

            return resolvers;
        },
        {}
    );

    if (node.nodes) {
        node.nodes = await Promise.all(
            node.nodes.map((n) => loadNode(n, { INTERNALS }))
        );
    }

    return node;
}

module.exports = loadNode;
