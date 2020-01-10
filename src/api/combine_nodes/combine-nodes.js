const { mergeTypeDefs, printWithComments } = require("graphql-toolkit");
const { isFunction, checkInstance } = require("../../util/index.js");
const { resolveAppliance } = require("../../methods/index.js");
const { loadNode } = require("../graphql_node/methods/index.js");
const APPLIANCE_METADATA = require("../../constants/appliance-metadata.js");

const GraphQLNode = require("../graphql_node/graphql-node.js");
const IdioError = require("../idio-error.js");

/**
 * @typedef {import('../graphql_node/graphql-node.js')} GraphQLNode
 * @typedef {import('../idio-scalar.js')} IdioScalar
 * @typedef {import('../idio-enum.js')} IdioEnum
 * @typedef {import('../idio-directive.js')} IdioDirective
 */

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

    return Object.freeze({
        typeDefs: printWithComments(mergeTypeDefs(typeDefs)),
        resolvers,
        schemaDirectives
    });
}

module.exports = combineNodes;
