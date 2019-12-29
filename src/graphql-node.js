const IdioEnum = require("./idio-enum.js");
const { parseTypeDefs } = require("./util/index.js");
const RESTRICTED_NAMES = require("./constants/restricted-names.js");
const IdioError = require("./idio-error.js");

/**
 * @callback PreHook
 * @param {any}    root - The GraphQl root argument.
 * @param {Object} args - The GraphQl args argument.
 * @param {Object} context - The GraphQl context argument.
 * @param {Object} info - The GraphQl info argument.
 */

/**
 * @callback PostHook
 * @param {any}    resolve - The outcome of the resolve method.
 * @param {any}    root - The GraphQl root argument.
 * @param {Object} args - The GraphQl args argument.
 * @param {Object} context - The GraphQl context argument.
 * @param {Object} info - The GraphQl info argument.
 */

/**
 * @typedef {(PostHook|Array.<PostHook>)} PreUnion
 */

/**
 * @typedef {(PreHook|Array.<PreHook>)} PostUnion
 */

/**
 * @typedef {Object} ResolverObjectInput
 * @property {Function} resolve - The resolver function.
 * @property {PreUnion} pre - Function(s) to call pre the resolve method.
 * @property {PostUnion} post - Function(s) to call post the resolve method.
 */

/**
 * @typedef {(ResolverObjectInput|Function)} ResolverUnion
 */

/**
 * @typedef {Object} ResolverType
 * @property {ResolverUnion} Query
 * @property {ResolverUnion} Mutation
 * @property {ResolverUnion} Subscription
 * @property {ResolverUnion} Fields
 */

/**
 * @typedef {(Function|any)} Injections
 */

/**
 * @typedef {import('./idio-enum.js')} IdioEnum
 */

/**
 * @typedef {Object} GraphQLNode
 * @property {string} name - The nodes name.
 * @property {Promise<string>} typeDefs - Graphql typeDefs resolver.
 * @property {ResolverType} resolvers - Graphql resolvers
 * @property {Array.<IdioEnum>} enums - The nodes enums.
 * @property {Array.<GraphQLNode>} nodes - The nodes nested nodes.
 * @property {Injections} injections - Function/any to be passed as the last argument to each resolver.
 */

/**
 * @typedef {Object} GraphQLNodeConfig
 * @property {name} name - The nodes name.
 * @property {string} typeDefs - Graphql typeDefs, use filePath, string, or gql-tag
 * @property {ResolverType} resolvers - The nodes resolvers.
 * @property {Array.<IdioEnum>} enums - The nodes enums.
 * @property {Array.<GraphQLNode>} nodes - The nodes nested nodes.
 * @property {Injections} injections - Function/any to be passed as the last argument to each resolver.
 */

/**
 * Creates a instance of a GraphQLNode.
 *
 * @param {GraphQLNodeConfig} config - An object.
 *
 * @returns GraphQLNode
 */
function GraphQLNode({
    name,
    typeDefs,
    resolvers,
    enums,
    nodes,
    injections
} = {}) {
    const prefix = "constructing GraphQLNode";

    this.name;
    this.typeDefs;
    this.resolvers;
    this.enums;
    this.nodes;
    this.injections;

    if (!name) {
        throw new IdioError(`${prefix}: name required.`);
    }

    if (typeof name !== `string`) {
        throw new IdioError(`${prefix}: name must be of type 'string'.`);
    }

    if (RESTRICTED_NAMES[name.toLowerCase()]) {
        throw new IdioError(
            `${prefix}: creating node '${name}' with invalid name.`
        );
    }

    this.name = name;

    if (!typeDefs) {
        throw new IdioError(`${prefix}: '${name}' typeDefs required.`);
    }

    try {
        this.typeDefs = parseTypeDefs(typeDefs);
    } catch (error) {
        throw new IdioError(`${prefix}: '${name}' Error: '${error}'.`);
    }

    if (!resolvers) {
        throw new IdioError(`${prefix}: '${name}' resolvers required.`);
    }

    const typeOfResolvers = typeof resolvers;

    if (typeOfResolvers !== "object") {
        throw new IdioError(
            `${prefix}: expected node: '${name}' resolvers to be of type 'object' but received '${typeOfResolvers}'.`
        );
    }

    const allowedResolvers = ["Query", "Mutation", "Subscription", "Fields"];

    const notAllowedResolvers = Object.keys(resolvers).filter(
        (key) => !allowedResolvers.includes(key)
    );

    if (notAllowedResolvers.length) {
        throw new IdioError(
            `${prefix}: '${name}' resolvers received unexpected properties '[ ${notAllowedResolvers.join(
                ", "
            )} ]'.`
        );
    }

    this.resolvers = resolvers;

    if (enums) {
        if (!Array.isArray(enums)) {
            throw new IdioError(
                `${prefix}: '${name}' enums must be of type 'array'.`
            );
        }

        function checkInstanceOfEnum(_enum) {
            if (!(_enum instanceof IdioEnum)) {
                throw new IdioError(
                    `${prefix}: '${name}' expected enum to be instance of IdioEnum, received ${JSON.stringify(
                        _enum,
                        undefined,
                        2
                    )}.`
                );
            }
        }

        enums.forEach(checkInstanceOfEnum);

        this.enums = enums;
    }

    if (nodes) {
        if (!Array.isArray(nodes)) {
            throw new IdioError(
                `${prefix}: '${name}' nodes must be of type 'array'.`
            );
        }

        function checkInstanceOfThis(node) {
            if (!(node instanceof GraphQLNode)) {
                throw new IdioError(
                    `${prefix}: '${name}' expected node to be instance of GraphQLNode, received: '${JSON.stringify(
                        node,
                        undefined,
                        2
                    )}'.`
                );
            }
        }

        nodes.forEach(checkInstanceOfThis);

        this.nodes = nodes;
    }

    if (injections) {
        this.injections = injections;
    }
}

module.exports = GraphQLNode;
