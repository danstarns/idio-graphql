const { mergeTypeDefs, printWithComments } = require("graphql-toolkit");
const { parse } = require("graphql/language");

const GraphQLNode = require("./graphql-node.js");
const IdioEnum = require("./idio-enum.js");
const IdioScalar = require("./idio-scalar.js");
const IdioDirective = require("./idio-directive.js");
const { parseTypeDefs, extractResolvers } = require("./util/index.js");

/**
 * @typedef {import('./idio-enum.js')} IdioEnum
 * @typedef {import('./idio-scalar.js')} IdioScalar
 * @typedef {import('./idio-directive.js')} IdioDirective
 * @typedef {import('./graphql-node.js')} GraphQLNode
 */

/**
 * @param {GraphQLNode} n
 */
async function loadNode(n) {
    const node = { ...n };

    node.typeDefs = await node.typeDefs();

    if (node.enums) {
        const loadedEnumsTypeDefs = (
            await Promise.all(
                node.enums.map(async (_enum) => `\n${await _enum.typeDefs()}\n`)
            )
        ).reduce((result, typeDef) => result + typeDef, "");

        node.typeDefs += `\n${loadedEnumsTypeDefs}\n`;

        node.enumResolvers = node.enums.reduce((result, _enum) => {
            result[`${_enum.name}`] = _enum.resolver;

            return result;
        }, {});
    }

    const resolverKeys = {
        Query: Object.keys(node.resolvers.Query || {}),
        Mutation: Object.keys(node.resolvers.Mutation || {}),
        Subscription: Object.keys(node.resolvers.Subscription || {}),
        Fields: Object.keys(node.resolvers.Fields || {})
    };

    let ast;

    try {
        ast = parse(node.typeDefs);
    } catch (error) {
        throw new Error(
            `combineNodes: loading node with name: '${node.name}' could not parse typeDefs: Error: ${error} `
        );
    }

    const nodeNameObjectType = ast.definitions
        .filter((definition) => {
            if (definition.kind === "ObjectTypeDefinition") {
                return definition;
            }

            return false;
        })
        .find((leaf) => {
            const {
                name: { value }
            } = leaf;

            return value === node.name;
        });

    if (!nodeNameObjectType) {
        throw new Error(
            `combineNodes: node with name '${node.name}' should contain a ObjectTypeDefinition called '${node.name}'`
        );
    }

    const nodeNameObjectTypeFields = nodeNameObjectType.fields.map((field) => {
        return field.name.value;
    });

    resolverKeys.Fields.forEach((key) => {
        if (!nodeNameObjectTypeFields.includes(key)) {
            throw new Error(
                `combineNodes: node with name: '${node.name}' has a Field resolver called '${key}' thats not defined in typeDefs`
            );
        }
    });

    const {
        Query: queryFields,
        Mutation: mutationFields,
        Subscription: subscriptionFields
    } = ["Query", "Mutation", "Subscription"].reduce(
        (result, type) => {
            const extracted = extractResolvers(ast, type);

            result[type] = [...result[type], ...extracted];

            return result;
        },
        { Query: [], Mutation: [], Subscription: [] }
    );

    queryFields.forEach((field) => {
        if (!resolverKeys.Query.includes(field)) {
            throw new Error(
                `combineNodes: node with name: '${node.name}' has a Query in the typeDefs called '${field}' thats not defined in resolvers`
            );
        }
    });

    resolverKeys.Query.forEach((key) => {
        if (!queryFields.includes(key)) {
            throw new Error(
                `combineNodes: node with name: '${node.name}' has a Query resolver called '${key}' thats not defined in typeDefs`
            );
        }
    });

    mutationFields.forEach((field) => {
        if (!resolverKeys.Mutation.includes(field)) {
            throw new Error(
                `combineNodes: node with name: '${node.name}' has a Mutation in the typeDefs called '${field}' thats not defined in resolvers`
            );
        }
    });

    resolverKeys.Mutation.forEach((key) => {
        if (!mutationFields.includes(key)) {
            throw new Error(
                `combineNodes: node with name: '${node.name}' has a Mutation resolver called '${key}' thats not defined in typeDefs`
            );
        }
    });

    subscriptionFields.forEach((field) => {
        if (!resolverKeys.Subscription.includes(field)) {
            throw new Error(
                `combineNodes: node with name: '${node.name}' has a Subscription in the typeDefs called '${field}' thats not defined in resolvers`
            );
        }
    });

    resolverKeys.Subscription.forEach((key) => {
        if (!subscriptionFields.includes(key)) {
            throw new Error(
                `combineNodes: node with name: '${node.name}' has a Subscription resolver called '${key}' thats not defined in typeDefs`
            );
        }
    });

    if (node.nodes) {
        node.nodes = await Promise.all(node.nodes.map(loadNode));
    }

    return node;
}

function reduceNode(result, node) {
    result.typeDefs.push(node.typeDefs);

    function mergeResolvers(instance) {
        ["Query", "Mutation", "Subscription"].forEach((key) => {
            result.resolvers[key] = {
                ...result.resolvers[key],
                ...(instance.resolvers[key] || {})
            };
        });
    }

    mergeResolvers(node);

    if (node.enumResolvers) {
        result.resolvers = {
            ...result.resolvers,
            ...node.enumResolvers
        };
    }

    if (result.INTERNALS.REGISTERED_NODES[node.name]) {
        throw new Error(
            `combineNodes: node with name '${node.name}' already registered`
        );
    }

    result.INTERNALS.REGISTERED_NODES[node.name] = node.name;

    result.resolvers[node.name] = node.resolvers.Fields || {};

    if (node.nodes) {
        node.nodes.forEach((nestedNode) => reduceNode(result, nestedNode));
    }

    return result;
}

/**
 * @param {Array.<IdioEnum>} enums
 */
async function resolveEnums(enums) {
    if (!Array.isArray(enums)) {
        throw new Error("expected enums to be an array");
    }

    function reduceEnum(result, _enum) {
        result.typeDefs += _enum.typeDefs;

        result.resolvers[_enum.name] = _enum.resolver;

        return result;
    }

    function checkInstanceOfEnum(_enum) {
        if (!(_enum instanceof IdioEnum)) {
            throw new Error(
                `expected enum to be of type IdioEnum, recived: ${JSON.stringify(
                    _enum,
                    undefined,
                    2
                )}`
            );
        }

        return _enum;
    }

    const { typeDefs, resolvers } = (
        await Promise.all(
            enums.map(async (_enum) => {
                checkInstanceOfEnum(_enum);

                return {
                    name: _enum.name,
                    typeDefs: `${await _enum.typeDefs()} `,
                    resolver: _enum.resolver
                };
            })
        )
    ).reduce(reduceEnum, {
        typeDefs: "",
        resolvers: {}
    });

    return { typeDefs, resolvers };
}

/**
 * @param {Array.<IdioDirective>} directives
 */
async function resolveDirectives(directives) {
    if (!Array.isArray(directives)) {
        throw new Error("expected directives to be an array");
    }

    function reduceDirective(result, directive) {
        result.typeDefs += directive.typeDefs;

        result.resolvers[directive.name] = directive.resolver;

        return result;
    }

    function checkInstanceOfDirective(directive) {
        if (!(directive instanceof IdioDirective)) {
            throw new Error(
                `expected directive to be of type IdioDirective, recived: ${JSON.stringify(
                    directive,
                    undefined,
                    2
                )}`
            );
        }

        return directive;
    }

    const { typeDefs, resolvers } = (
        await Promise.all(
            directives.map(async (directive) => {
                checkInstanceOfDirective(directive);

                return {
                    name: directive.name,
                    typeDefs: `${await directive.typeDefs()} `,
                    resolver: directive.resolver
                };
            })
        )
    ).reduce(reduceDirective, {
        typeDefs: "",
        resolvers: {}
    });

    return { typeDefs, resolvers };
}

/**
 * @param {Array.<IdioScalar>} scalars
 */
async function resolveScalars(scalars) {
    if (!Array.isArray(scalars)) {
        throw new Error("expected scalars to be an array");
    }

    function reduceScalar(result, { name, resolver }) {
        result.typeDefs += `\nscalar ${name}\n`;

        result.resolvers[name] = resolver;

        return result;
    }

    function checkInstanceOfScalar(scalar) {
        if (!(scalar instanceof IdioScalar)) {
            throw new Error(
                `expected scalar to be of type IdioScalar, recived: ${JSON.stringify(
                    scalar,
                    undefined,
                    2
                )}`
            );
        }

        return scalar;
    }

    const { typeDefs, resolvers } = scalars
        .map(checkInstanceOfScalar)
        .reduce(reduceScalar, {
            typeDefs: "",
            resolvers: {}
        });

    return { typeDefs, resolvers };
}

/**
 * @typedef {Object} Schema
 * @property {string} typeDefs - graphql typeDefs.
 * @property {Object} resolvers - graphql resolvers.
 * @property {Object} resolvers.Query - graphql resolvers.Query.
 * @property {Object} resolvers.Mutation - graphql resolvers.Mutation.
 * @property {Object} resolvers.Subscription - graphql resolvers.Subscription.
 * @property {Object} schemaDirectives - graphql schemaDirectives resolvers.
 */

/**
 * @typedef {Object} appliances
 * @property {Array.<IdioScalar>} scalars
 * @property {Array.<IdioEnum>} enums
 * @property {Array.<IdioDirective>} directives
 * @property {any} schemaGlobals - an Array or a single instance of Graphql typedefs, use filePath, string, or gql-tag.
 */

/**
 * Combines and returns the combined typeDefs and resolvers, ready to be passed into apollo-server, graphQL-yoga & makeExecutableSchema.
 *
 * @param {Array.<GraphQLNode>} nodes - Array of type GraphQLNode.
 * @param {appliances} appliances
 * @returns Schema
 */
async function combineNodes(nodes, appliances = {}) {
    if (!nodes) {
        throw new Error("combineNodes: nodes required");
    }

    if (!Array.isArray(nodes)) {
        throw new Error(
            `combineNodes: expected nodes to be of type array recived '${typeof nodes}'`
        );
    }

    function checkInstanceOfNode(node) {
        if (!(node instanceof GraphQLNode)) {
            throw new Error(
                `combineNodes: recived a node not a instance of GraphQLNode. ${JSON.stringify(
                    node,
                    undefined,
                    2
                )}`
            );
        }
    }

    nodes.forEach(checkInstanceOfNode);

    let schemaDirectives = {};

    let { typeDefs, resolvers } = (
        await Promise.all(nodes.map(loadNode))
    ).reduce(reduceNode, {
        INTERNALS: {
            REGISTERED_NODES: {}
        },
        typeDefs: [],
        resolvers: {
            Query: {},
            Mutation: {},
            Subscription: {}
        }
    });

    if (appliances.scalars) {
        const resolvedScalars = await resolveScalars(appliances.scalars);

        typeDefs.push(resolvedScalars.typeDefs);

        resolvers = { ...resolvers, ...resolvedScalars.resolvers };
    }

    if (appliances.enums) {
        const resolvedEnums = await resolveEnums(appliances.enums);

        typeDefs.push(resolvedEnums.typeDefs);

        resolvers = { ...resolvers, ...resolvedEnums.resolvers };
    }

    if (appliances.directives) {
        const resolvedDirectives = await resolveDirectives(
            appliances.directives
        );

        typeDefs.push(resolvedDirectives.typeDefs);

        schemaDirectives = resolvedDirectives.resolvers;
    }

    if (appliances.schemaGlobals) {
        if (Array.isArray(appliances.schemaGlobals)) {
            (
                await Promise.all(
                    appliances.schemaGlobals.map((def) => parseTypeDefs(def)())
                )
            ).forEach((def) => typeDefs.push(def));
        } else {
            typeDefs.push(await parseTypeDefs(appliances.schemaGlobals)());
        }
    }

    function isFunction(value) {
        return (
            value &&
            (Object.prototype.toString.call(value) === "[object Function]" ||
                typeof value === "function" ||
                value instanceof Function)
        );
    }

    function deleteEmptyResolver(key) {
        if (
            !isFunction(resolvers[key]) &&
            !Object.keys(resolvers[key]).length
        ) {
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
