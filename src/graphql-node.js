const IdioEnum = require("./idio-enum.js");
const { parseTypeDefs } = require("./util/index.js");

/**
 * @typedef {import('./idio-enum.js')} IdioEnum
 */

/**
 * @typedef {Object} GraphQLNode
 * @property {string} name - The nodes name.
 * @property {Promise<string>} typeDefs - Graphql typeDefs resolver.
 * @property {Object} resolvers - Graphql resolvers
 * @property {Object} resolvers.Query - Graphql resolvers.Query
 * @property {Object} resolvers.Mutation - Graphql resolvers.Mutation
 * @property {Object} resolvers.Subscription - Graphql resolvers.Subscription
 * @property {Object} resolvers.Fields - Graphql resolvers.Fields
 * @property {Array.<IdioEnum>} enums - The nodes enums.
 * @property {Array.<GraphQLNode>} nodes - The nodes nested nodes.
 */

/**
 * @typedef {Object} GraphQLNodeConfig
 * @property {name} name - The nodes name.
 * @property {string} typeDefs - Graphql typedefs, use filePath, string, or gql-tag
 * @property {{Query: {Object}, Mutation: {Object}, Subscription: {Object}, Fields: {Object} }} resolvers - The nodes resolvers.
 * @property {Array.<IdioEnum>} enums - The nodes enums.
 * @property {Array.<GraphQLNode>} nodes - The nodes nested nodes.
 */

/**
 * Creates a instance of a GraphQLNode.
 *
 * @param {GraphQLNodeConfig} config - An object.
 *
 * @returns GraphQLNode
 */
function GraphQLNode({ name, typeDefs, resolvers, enums, nodes } = {}) {
    this.name;
    this.typeDefs;
    this.resolvers;
    this.enums;
    this.nodes;

    if (!name) {
        throw new Error("GraphQLNode: name required");
    }

    if (typeof name !== "string") {
        throw new Error("GraphQLNode: name must be of type 'string'");
    }

    const notAllowedNodeNames = {
        query: 1,
        mutation: 1,
        subscription: 1,
        fields: 1
    };

    if (notAllowedNodeNames[name.toLowerCase()]) {
        throw new Error(
            `GraphQLNode: creating node '${name}' with invalid name`
        );
    }

    this.name = name;

    if (!typeDefs) {
        throw new Error(
            `GraphQLNode: creating node: '${name}' typeDefs required`
        );
    }

    try {
        this.typeDefs = parseTypeDefs(typeDefs);
    } catch (error) {
        throw new Error(
            `GraphQLNode: creating node: '${name}' Error: '${error}'`
        );
    }

    if (!resolvers) {
        throw new Error(
            `GraphQLNode: creating node: '${name}' resolvers required`
        );
    }

    const typeOfResolvers = typeof resolvers;

    if (typeOfResolvers !== "object") {
        throw new Error(
            `GraphQLNode: expected node: '${name}' resolvers to be of type 'object' but recived '${typeOfResolvers}'`
        );
    }

    const allowedResolvers = ["Query", "Mutation", "Subscription", "Fields"];

    const notAllowedResolvers = Object.keys(resolvers).filter(
        (key) => !allowedResolvers.includes(key)
    );

    if (notAllowedResolvers.length) {
        throw new Error(
            `GraphQLNode: creating node: '${name}' resolvers recived unexpected properties '[ ${notAllowedResolvers.join(
                ", "
            )} ]'`
        );
    }

    this.resolvers = resolvers;

    if (enums) {
        if (!Array.isArray(enums)) {
            throw new Error(
                `GraphQLNode: creating node: '${name}' enums must be of type 'array'`
            );
        }

        function checkInstanceOfEnum(_enum) {
            if (!(_enum instanceof IdioEnum)) {
                throw new Error(
                    `GraphQLNode: creating node: '${name}' expected enum to be instance of IdioEnum, recived ${JSON.stringify(
                        _enum,
                        undefined,
                        2
                    )}`
                );
            }
        }

        enums.forEach(checkInstanceOfEnum);

        this.enums = enums;
    }

    if (nodes) {
        if (!Array.isArray(nodes)) {
            throw new Error(
                `GraphQLNode: creating node: '${name}' nodes must be of type 'array'`
            );
        }

        function checkInstanceOfThis(node) {
            if (!(node instanceof GraphQLNode)) {
                throw new Error(
                    `GraphQLNode: creating node: '${name}' expected node to be instance of GraphQLNode, recived: '${JSON.stringify(
                        node,
                        undefined,
                        2
                    )}'`
                );
            }
        }

        nodes.forEach(checkInstanceOfThis);

        this.nodes = nodes;
    }
}

module.exports = GraphQLNode;
