const { mergeTypeDefs, printWithComments } = require("graphql-toolkit");
const { isFunction, checkInstance } = require("../util/index.js");
const { resolveAppliance } = require("./appliances/methods/index.js");
const { loadNode } = require("./graphql_node/methods/index.js");
const APPLIANCE_METADATA = require("../constants/appliance-metadata.js");

const GraphQLNode = require("./graphql_node/graphql-node.js");
const IdioError = require("./idio-error.js");

/**
 * @typedef {import('./graphql_node/graphql-node.js')} GraphQLNode
 * @typedef {import('./appliances/idio-scalar.js')} IdioScalar
 * @typedef {import('./appliances/idio-enum.js')} IdioEnum
 * @typedef {import('./appliances/idio-directive.js')} IdioDirective
 * @typedef {import('./appliances/idio-interface')} IdioInterface
 * @typedef {import('./appliances/idio-union.js')} IdioUnion
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

    if (node.interfaceResolvers) {
        result.resolvers = {
            ...result.resolvers,
            ...node.interfaceResolvers
        };
    }

    if (node.unionResolvers) {
        result.resolvers = {
            ...result.resolvers,
            ...node.unionResolvers
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
 * @property {string} typeDefs
 * @property {Object} resolvers
 * @property {Object} resolvers.Query
 * @property {Object} resolvers.Mutation
 * @property {Object} resolvers.Subscription
 * @property {Object} schemaDirectives
 */

/**
 * @typedef {Object} appliances
 * @property {Array.<IdioScalar>} scalars
 * @property {Array.<IdioEnum>} enums
 * @property {Array.<IdioDirective>} directives
 * @property {Array.<IdioInterface>} interfaces
 * @property {Array.<IdioUnion>} unions
 * @property {any} schemaGlobals - an Array or a single instance of Graphql typeDefs, use filePath, string, or gql-tag.
 */

/**
 * You can use combineNodes to snap GraphQLNode's & Schema Appliances together into a single Schema.
 *
 * @param {Array.<GraphQLNode>} nodes
 * @param {appliances} appliances
 * @returns {Schema}
 */
function combineNodes(nodes, appliances = {}) {
    let schemaDirectives = {};

    if (!nodes) {
        throw new IdioError("Nodes required.");
    }

    if (!Array.isArray(nodes)) {
        throw new IdioError(
            `Expected nodes to be of type Array received '${typeof nodes}'.`
        );
    }

    const INTERNALS = {
        REGISTERED_NAMES: {}
    };

    const loadedNodes = nodes.map((node) => loadNode(node, { INTERNALS }));

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
        typeDefs: printWithComments(mergeTypeDefs([typeDefs.join("\n")])),
        resolvers,
        schemaDirectives
    };
}

module.exports = combineNodes;
