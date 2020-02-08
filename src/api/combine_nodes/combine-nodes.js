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
 * @typedef {Object} Schema
 * @property {GraphQLSchema} schema
 * @property {string} typeDefs
 * @property {Object} resolvers
 * @property {Object} resolvers.Query
 * @property {Object} resolvers.Mutation
 * @property {Object} resolvers.Subscription
 * @property {Object} schemaDirectives
 */

/**
 * You can use combineNodes to snap GraphQLNode's & Schema Appliances together into a single Schema.
 *
 * @param {Array.<GraphQLNode>} nodes
 * @param {appliances} appliances
 * @returns {Schema}
 */
function combineNodes(nodes, appliances = {}) {
    const RUNTIME = {
        REGISTERED_NAMES: {}
    };

    validateNodes(nodes, RUNTIME);

    validateAppliances(appliances, RUNTIME);

    const reducedNodes = reduceNodes(nodes);

    const reducedAppliances = reduceAppliances(appliances);

    /** @type {Schema} */
    const Schema = {
        typeDefs: printWithComments(
            mergeTypeDefs([
                ...reducedNodes.typeDefs,
                ...reducedAppliances.typeDefs
            ])
        ),
        resolvers: {
            ...reducedNodes.resolvers,
            ...reducedAppliances.resolvers
        },
        ...(reducedAppliances.schemaDirectives
            ? { schemaDirectives: reducedAppliances.schemaDirectives }
            : {})
    };

    Schema.schema = makeExecutableSchema({ ...Schema });

    return Schema;
}

module.exports = combineNodes;
