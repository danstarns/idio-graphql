const fs = require("fs");
const caller = require("caller");
const path = require("path");
const IdioEnum = require("./IdioEnum.js");

/**
 * @typedef {import('./IdioEnum.js')} IdioEnum
 */

/**
 * @typedef {Object} GraphQLNode
 * @property {string} name - The nodes name.
 * @property {string} typeDefs - Path to the nodes gql file.
 * @property {Object} resolvers - Graphql resolvers
 * @property {Object} resolvers.Query - Graphql resolvers.Query
 * @property {Object} resolvers.Mutation - Graphql resolvers.Mutation
 * @property {Object} resolvers.Subscription - Graphql resolvers.Subscription
 * @property {Object} resolvers.Fields - Graphql resolvers.Fields
 * @property {Array.<IdioEnum>} enums - The nodes enums.
 */

/**
 * @typedef {Object} GraphQLNodeConfig
 * @property {name} name - The nodes name.
 * @property {string} typeDefs - Path to the nodes gql file.
 * @property {{Query: {Object}, Mutation: {Object}, Subscription: {Object}, Fields: {Object} }} resolvers - \The nodes resolvers.
 * @property {Array.<IdioEnum>} enums - The nodes enums.
 */

/**
 * Creates a instance of a GraphQLNode.
 *
 * @param {GraphQLNodeConfig} config - An object.
 *
 * @returns GraphQLNode
 */
function GraphQLNode({ name, typeDefs, resolvers, enums } = {}) {
    if (!name) {
        throw new Error("GraphQLNode: name required");
    }

    if (typeof name !== "string") {
        throw new Error("GraphQLNode: name must be of type 'string'");
    }

    if (!typeDefs) {
        throw new Error("GraphQLNode: typeDefs required");
    }

    if (typeof typeDefs !== "string") {
        throw new Error("GraphQLNode: name must be of type 'string'");
    }

    if (!resolvers) {
        throw new Error(
            `GraphQLNode: creating node: '${name}' without resolvers`
        );
    }

    const resolversConstructor = resolvers.constructor.name;
    const typeOfResolvers = typeof resolvers;

    if (resolversConstructor !== "Object") {
        throw new Error(
            `GraphQLNode: expected node: '${name}' resolvers to be of type 'Object' but recived '${resolversConstructor}'/${typeOfResolvers}`
        );
    }

    if (!fs.existsSync(typeDefs)) {
        typeDefs = path.normalize(path.join(path.dirname(caller()), typeDefs));

        if (!fs.existsSync(typeDefs)) {
            throw new Error(
                `GraphQLNode: typeDefs path '${typeDefs}' does not exist`
            );
        }
    }

    if (enums) {
        if (!Array.isArray(enums)) {
            throw new Error(
                `GraphQLNode: creating node: '${name}' enums must be of type array`
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
    }

    this.name = name;
    this.typeDefs = typeDefs;
    this.resolvers = resolvers;
    this.enums = enums;
}

module.exports = GraphQLNode;
