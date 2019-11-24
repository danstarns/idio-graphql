const fs = require("fs");
const caller = require("caller");
const path = require("path");

/**
 * @typedef {Object} GraphQLNode
 * @property {string} name - The nodes name.
 * @property {string} typeDefs - Path to the nodes graphql file.
 * @property {Object} resolvers - graphql resolvers
 * @property {Object} resolvers.Query - graphql resolvers.Query
 * @property {Object} resolvers.Mutation - graphql resolvers.Mutation
 * @property {Object} resolvers.Subscription - graphql resolvers.Subscription
 * @property {Object} resolvers.Fields - graphql resolvers.Fields
 */

/**
 * Creates a instance of a GraphQLNode, should be used as the index to your node.
 *
 * @typedef {Object} GraphQLNode

 * @param {Object} config - An object.
 * @param {string} config.name - The nodes name
 * @param {string} config.typeDefs - Path to the nodes graphql file.
 * @param {{Query: {Object}, Mutation: {Object}, Subscription: {Object}, Fields: {Object} }} config.resolvers - Nodes resolvers.
 * 
 *  @returns GraphQLNode
 */
function GraphQLNode({ name, typeDefs, resolvers } = {}) {
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

    this.name = name;
    this.typeDefs = typeDefs;
    this.resolvers = resolvers;
}

module.exports = GraphQLNode;
