const { mergeTypeDefs, printWithComments } = require("graphql-toolkit");
const { makeExecutableSchema } = require("graphql-tools");
const {
    validateAppliances,
    validateNodes,
    reduceNodes,
    reduceAppliances
} = require("./methods/index.js");

/**
 * @typedef {import('../graphql_node/graphql-node.js').GraphQLNode} GraphQLNode
 * @typedef {import('../appliances/index.js').appliances} appliances
 * @typedef {import('graphql').GraphQLSchema} GraphQLSchema
 */

/**
 * @typedef RUNTIME
 * @property {object} REGISTERED_NAMES
 * @property {GraphQLSchema} schema
 * @property {string} typeDefs
 * @property {object} resolvers
 * @property {object} resolvers.Query
 * @property {object} resolvers.Mutation
 * @property {object} resolvers.Subscription
 * @property {object} schemaDirectives
 */

/**
 * You can use combineNodes to snap GraphQLNode's & Schema Appliances together into a single Schema.
 *
 * @param {Array.<GraphQLNode>} nodes
 * @param {appliances} appliances
 * @returns {RUNTIME}
 */
function combineNodes(nodes, appliances = {}) {
    const RUNTIME = {
        REGISTERED_NAMES: {},
        schema: {},
        typeDefs: "",
        resolvers: {},
        schemaDirectives: {}
    };

    validateNodes(nodes, RUNTIME);

    validateAppliances(appliances, RUNTIME);

    const reducedNodes = reduceNodes(nodes);

    const reducedAppliances = reduceAppliances(appliances);

    RUNTIME.typeDefs = printWithComments(
        mergeTypeDefs([...reducedNodes.typeDefs, ...reducedAppliances.typeDefs])
    );

    RUNTIME.resolvers = {
        ...reducedNodes.resolvers,
        ...reducedAppliances.resolvers
    };

    if (reducedAppliances.schemaDirectives) {
        RUNTIME.schemaDirectives = reducedAppliances.schemaDirectives;
    }

    RUNTIME.schema = makeExecutableSchema({
        resolvers: RUNTIME.resolvers,
        typeDefs: RUNTIME.typeDefs,
        schemaDirectives: RUNTIME.schemaDirectives
    });

    return RUNTIME;
}

module.exports = combineNodes;
