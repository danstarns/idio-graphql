const { parse } = require("graphql/language/parser");
const GraphQLNode = require("./GraphQLNode.js");
const graphQLLoader = require("./graphQLLoader.js");
const IdioEnum = require("./IdioEnum.js");
const IdioScalar = require("./IdioScalar.js");

/**
 * @typedef {import('./IdioEnum.js')} IdioEnum
 * @typedef {import('./IdioScalar.js')} IdioScalar
 * @typedef {import('./GraphQLNode.js')} GraphQLNode
 */

async function loadNode(n) {
    const node = { ...n };

    node.typeDefs = await graphQLLoader(node.typeDefs);

    if (node.enums) {
        const loadedEnumsTypeDefs = (
            await Promise.all(
                node.enums.map(
                    async (_enum) =>
                        `\n${await graphQLLoader(_enum.typeDefs)}\n`
                )
            )
        ).reduce((result, typeDef) => result + typeDef, "");

        node.typeDefs += `\n${loadedEnumsTypeDefs}\n`;

        node.enumResolvers = node.enums.reduce((result, _enum) => {
            result[`${_enum.name}`] = _enum.resolver;

            return result;
        }, {});
    }

    return node;
}

function astContainsRootType(ast, type) {
    return ast.definitions
        .filter((node) => node.kind === "ObjectTypeDefinition")
        .find((node) => node.name.value === type);
}

function astContainsExtensionRootType(ast, type) {
    return ast.definitions
        .filter((node) => node.kind === "ObjectTypeExtension")
        .find((node) => node.name.value === type);
}

function reduceNodes(result, node) {
    const ast = parse(node.typeDefs);

    if (astContainsRootType(ast, "Query")) {
        throw new Error(
            `combineNodes: ${node.name} contains: "type Query" replace with "extend type Query"`
        );
    }

    if (astContainsRootType(ast, "Mutation")) {
        throw new Error(
            `combineNodes: ${node.name} contains: "type Mutation" replace with "extend type Mutation"`
        );
    }

    if (astContainsRootType(ast, "Subscription")) {
        throw new Error(
            `combineNodes: ${node.name} contains: "type Subscription" replace with "extend type Subscription"`
        );
    }

    if (
        !result.haveSeenExtendTypeQuery &&
        astContainsExtensionRootType(ast, "Query")
    ) {
        result.haveSeenExtendTypeQuery = true;
    }

    if (
        !result.haveSeenExtendTypeMutation &&
        astContainsExtensionRootType(ast, "Mutation")
    ) {
        result.haveSeenExtendTypeMutation = true;
    }

    if (
        !result.haveSeenExtendTypeSubscription &&
        astContainsExtensionRootType(ast, "Subscription")
    ) {
        result.haveSeenExtendTypeSubscription = true;
    }

    result.typeDefs = `${result.typeDefs}\n${node.typeDefs}\n`;

    result.resolvers.Query = {
        ...result.resolvers.Query,
        ...(node.resolvers.Query || {})
    };

    result.resolvers.Mutation = {
        ...result.resolvers.Mutation,
        ...(node.resolvers.Mutation || {})
    };

    result.resolvers.Subscription = {
        ...result.resolvers.Subscription,
        ...(node.resolvers.Subscription || {})
    };

    if (node.enumResolvers) {
        result.resolvers = {
            ...result.resolvers,
            ...node.enumResolvers
        };
    }

    result.resolvers[node.name] = node.resolvers.Fields || {};

    return result;
}

function checkInstanceOfNode(node) {
    if (!(node instanceof GraphQLNode)) {
        throw new Error(
            `combineNodes: recived node not a instance of GraphQLNode. ${JSON.stringify(
                node,
                undefined,
                2
            )}`
        );
    }

    return node;
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
                    typeDefs: `${await graphQLLoader(_enum.typeDefs)} `,
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
 * @property {string} typeDefs - graphql typeDefs
 * @property {Object} resolvers - graphql resolvers
 * @property {Object} resolvers.Query - graphql resolvers.Query
 * @property {Object} resolvers.Mutation - graphql resolvers.Mutation
 * @property {Object} resolvers.Subscription - graphql resolvers.Subscription
 */

/**
 * @typedef {Object} appliances
 * @property {Array.<IdioScalar>} scalars - array of IdioScalar
 * @property {Array.<IdioEnum>} enums - array of IdioEnum
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
            `combineNodes: expected nodes to be of type array recived ${typeof nodes} `
        );
    }

    let {
        haveSeenExtendTypeQuery,
        haveSeenExtendTypeMutation,
        haveSeenExtendTypeSubscription,
        typeDefs,
        resolvers
    } = (
        await Promise.all(
            nodes.map((node) => loadNode(checkInstanceOfNode(node)))
        )
    ).reduce(reduceNodes, {
        haveSeenExtendTypeQuery: false,
        haveSeenExtendTypeMutation: false,
        haveSeenExtendTypeSubscription: false,
        typeDefs: "",
        resolvers: {
            Query: {},
            Mutation: {},
            Subscription: {}
        }
    });

    if (appliances.scalars) {
        const resolvedScalars = await resolveScalars(appliances.scalars);

        typeDefs += `\n${resolvedScalars.typeDefs}\n`;

        resolvers = { ...resolvers, ...resolvedScalars.resolvers };
    }

    if (appliances.enums) {
        const resolvedEnums = await resolveEnums(appliances.enums);

        typeDefs += `\n${resolvedEnums.typeDefs}\n`;

        resolvers = { ...resolvers, ...resolvedEnums.resolvers };
    }

    if (haveSeenExtendTypeQuery) {
        typeDefs += "\ntype Query\n";
    }

    if (haveSeenExtendTypeMutation) {
        typeDefs += "\ntype Mutation\n";
    }

    if (haveSeenExtendTypeSubscription) {
        typeDefs += "\ntype Subscription\n";
    }

    function deleteEmptyResolver(key) {
        if (!Object.keys(resolvers[key]).length) {
            delete resolvers[key];
        }
    }

    ["Query", "Mutation", "Subscription"].forEach(deleteEmptyResolver);

    return {
        typeDefs,
        resolvers
    };
}

module.exports = combineNodes;
