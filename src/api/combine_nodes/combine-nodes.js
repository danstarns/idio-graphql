const { mergeTypeDefs, printWithComments } = require("graphql-toolkit");
const { resolveAppliances } = require("../appliances/methods/index.js");
const { loadNode } = require("../graphql_node/methods/index.js");
const APPLIANCE_METADATA = require("../../constants/appliance-metadata.js");
const { checkInstance } = require("../../util/index.js");
const GraphQLNode = require("../graphql_node/graphql-node.js");
const IdioError = require("../idio-error.js");

/**
 * @typedef {import('../graphql_node/graphql-node.js')} GraphQLNode
 * @typedef {import('../appliances/idio-scalar.js')} IdioScalar
 * @typedef {import('../appliances/idio-enum.js')} IdioEnum
 * @typedef {import('../appliances/idio-directive.js')} IdioDirective
 * @typedef {import('../appliances/idio-interface')} IdioInterface
 * @typedef {import('../appliances/idio-union.js')} IdioUnion
 */

function reduceNode(result, node) {
    result.typeDefs.push(node.typeDefs);

    result.resolvers = {
        ...result.resolvers,
        ...Object.entries(node.resolvers)
            .filter(([key]) => key !== "Fields")
            .reduce((res, [key, value]) => ({ ...res, [key]: value }), {}),
        [node.name]: node.resolvers.Fields || {}
    };

    if (node.nodes) {
        node.nodes.forEach((nestedNode) => reduceNode(result, nestedNode));
    }

    return result;
}

function validateAppliances(appliances, RUNTIME) {
    Object.entries(appliances)
        .filter(([key]) =>
            APPLIANCE_METADATA.map(({ name }) => name).includes(key)
        )
        .forEach(([key, values]) => {
            const metadata = APPLIANCE_METADATA.find(
                ({ name }) => name === key
            );

            values.forEach((value) => {
                checkInstance({
                    instance: value,
                    of: metadata._Constructor,
                    name: metadata.singular
                });

                if (RUNTIME.REGISTERED_NAMES[value.name]) {
                    throw new IdioError(
                        `loading ${metadata._Constructor.name} with a name: '${value.name}' thats already registered.`
                    );
                }

                RUNTIME.REGISTERED_NAMES[value.name] = 1;
            });
        });
}

function validateNodes(nodes, RUNTIME) {
    nodes.forEach((node) => {
        checkInstance({
            instance: node,
            of: GraphQLNode,
            name: "node"
        });

        if (RUNTIME.REGISTERED_NAMES[node.name]) {
            throw new IdioError(
                `GraphQLNode with name: '${node.name}' already registered.`
            );
        }

        RUNTIME.REGISTERED_NAMES[node.name] = 1;
    });
}

function reduceAppliances(appliances, INTERNALS) {
    return APPLIANCE_METADATA.reduce(
        (result, metadata) => {
            const appliance = appliances[metadata.name];

            if (appliance) {
                const { typeDefs, resolvers = {} } = resolveAppliances(
                    { ...metadata, appliance },
                    INTERNALS
                );

                result.typeDefs.push(typeDefs);

                if (metadata.name === "directives") {
                    return {
                        ...result,
                        schemaDirectives: {
                            ...result.schemaDirectives,
                            ...resolvers
                        }
                    };
                }

                return {
                    ...result,
                    resolvers: {
                        ...result.resolvers,
                        ...resolvers
                    }
                };
            }

            return result;
        },
        { resolvers: {}, typeDefs: [], schemaDirectives: {} }
    );
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
    const RUNTIME = {
        REGISTERED_NAMES: {}
    };

    validateNodes(nodes, RUNTIME);

    validateAppliances(appliances, RUNTIME);

    nodes = nodes
        .map((node) => loadNode(node, { INTERNALS }))
        .reduce(reduceNode, {
            INTERNALS,
            typeDefs: [],
            resolvers: {}
        });

    appliances = reduceAppliances(appliances, INTERNALS);

    return {
        typeDefs: printWithComments(
            mergeTypeDefs([...nodes.typeDefs, ...appliances.typeDefs])
        ),
        resolvers: {
            ...nodes.resolvers,
            ...appliances.resolvers
        },
        schemaDirectives: appliances.schemaDirectives
    };
}

module.exports = combineNodes;
