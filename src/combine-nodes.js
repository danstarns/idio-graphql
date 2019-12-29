const { mergeTypeDefs, printWithComments } = require("graphql-toolkit");
const { parse } = require("graphql/language");
const {
    parseTypeDefs,
    isFunction,
    checkInstance,
    wrappedResolver
} = require("./util/index.js");

const APPLIANCE_METADATA = require("./constants/appliance-metadata.js");

const GraphQLNode = require("./graphql-node.js");
const IdioError = require("./idio-error.js");

/**
 * @typedef {import('./graphql-node.js')} GraphQLNode
 * @typedef {import('./idio-scalar.js')} IdioScalar
 * @typedef {import('./idio-enum.js')} IdioEnum
 * @typedef {import('./idio-directive.js')} IdioDirective
 */

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

function reduceNode(result, node) {
    result.typeDefs.push(node.typeDefs);

    ["Query", "Mutation", "Subscription"].forEach((key) => {
        result.resolvers[key] = {
            ...result.resolvers[key],
            ...(node.resolvers[key] || {})
        };
    });

    if (node.enumResolvers) {
        result.resolvers = {
            ...result.resolvers,
            ...node.enumResolvers
        };
    }

    if (result.INTERNALS.REGISTERED_NAMES[node.name]) {
        throw new IdioError(
            `GraphQLNode with name: '${node.name}' already registered.`
        );
    }

    result.INTERNALS.REGISTERED_NAMES[node.name] = 1;

    result.resolvers[node.name] = node.resolvers.Fields || {};

    if (node.nodes) {
        node.nodes.forEach((nestedNode) => reduceNode(result, nestedNode));
    }

    return result;
}

/**
 * @typedef {Object} Schema
 * @property {string} typeDefs - GraphQL typeDefs.
 * @property {Object} resolvers - GraphQL resolvers.
 * @property {Object} resolvers.Query - GraphQL resolvers.Query.
 * @property {Object} resolvers.Mutation - GraphQL resolvers.Mutation.
 * @property {Object} resolvers.Subscription - GraphQL resolvers.Subscription.
 * @property {Object} schemaDirectives - GraphQL schemaDirectives resolvers.
 */

/**
 * @typedef {Object} appliances
 * @property {Array.<IdioScalar>} scalars
 * @property {Array.<IdioEnum>} enums
 * @property {Array.<IdioDirective>} directives
 * @property {any} schemaGlobals - an Array or a single instance of Graphql typeDefs, use filePath, string, or gql-tag.
 */

/**
 * Combines and returns the combined typeDefs and resolvers, ready to be passed into apollo-server, graphQL-yoga & makeExecutableSchema.
 *
 * @param {Array.<GraphQLNode>} nodes - Array of type GraphQLNode.
 * @param {appliances} appliances
 * @returns Schema
 */
async function combineNodes(nodes, appliances = {}) {
    let schemaDirectives = {};

    if (!nodes) {
        throw new IdioError("nodes required.");
    }

    if (!Array.isArray(nodes)) {
        throw new IdioError(
            `expected nodes to be of type array received '${typeof nodes}'.`
        );
    }

    const INTERNALS = {
        REGISTERED_NAMES: {}
    };

    const loadedNodes = await Promise.all(
        nodes.map((node) => {
            checkInstance({
                instance: node,
                of: GraphQLNode,
                name: "node"
            });

            return loadNode(node, { INTERNALS });
        })
    );

    let { typeDefs, resolvers } = loadedNodes.reduce(reduceNode, {
        INTERNALS,
        typeDefs: [],
        resolvers: {
            Query: {},
            Mutation: {},
            Subscription: {}
        }
    });

    await Promise.all(
        APPLIANCE_METADATA.map(async (metadata) => {
            const appliance = appliances[metadata.name];

            if (appliance) {
                const result = await resolveAppliance({
                    ...metadata,
                    appliance,
                    INTERNALS
                });

                typeDefs.push(result.typeDefs);

                if (metadata.name === "directives") {
                    schemaDirectives = result.resolvers;

                    return;
                }

                resolvers = { ...resolvers, ...(result.resolvers || {}) };
            }
        })
    );

    function deleteEmptyResolver(key) {
        const resolver = resolvers[key];

        if (!isFunction(resolver) && !Object.keys(resolver).length) {
            delete resolvers[key];
        }
    }

    Object.keys(resolvers).forEach(deleteEmptyResolver);

    return {
        typeDefs: printWithComments(mergeTypeDefs(typeDefs)),
        resolvers,
        schemaDirectives
    };
}

module.exports = combineNodes;
