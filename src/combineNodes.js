const GraphQLNode = require("./GraphQLNode.js");
const graphQLLoader = require("./graphQLLoader.js");

// [^d\s*] not after 'extend '
const QueryRegex = /\s*[^d\s*]\s*type\s*Query/g;
const MutationRegex = /\s*[^d\s*]\s*type\s*Mutation/g;
const SubscriptionRegex = /\s*[^d\s*]\s*type\s*Subscription/g;

const ExtendQueryRegex = /\s*extend\s*type\s*Query/g;
const ExtendMutationRegex = /\s*extend\s*type\s*Mutation/g;
const ExtendSubscriptionRegex = /\s*extend\s*type\s*Subscription/g;

async function loadNode(n) {
    const node = { ...n };

    node.typeDefs = await graphQLLoader(node.typeDefs);

    return node;
}

function typeDefsContainsRootTypes(typeDefs) {
    let query = false;
    let mutation = false;
    let subscription = false;

    if (QueryRegex.test(typeDefs)) {
        query = true;
    }

    if (MutationRegex.test(typeDefs)) {
        mutation = true;
    }

    if (SubscriptionRegex.test(typeDefs)) {
        subscription = true;
    }

    return [query, mutation, subscription];
}

function typeDefsExtendsRootTypes(typeDefs) {
    let query = false;
    let mutation = false;
    let subscription = false;

    if (ExtendQueryRegex.test(typeDefs)) {
        query = true;
    }

    if (ExtendMutationRegex.test(typeDefs)) {
        mutation = true;
    }

    if (ExtendSubscriptionRegex.test(typeDefs)) {
        subscription = true;
    }

    return [query, mutation, subscription];
}

function reduceNodes(result, currentValue, index) {
    const [
        typeQuery,
        typeMutation,
        typeSubscription
    ] = typeDefsContainsRootTypes(currentValue.typeDefs);

    if (typeQuery) {
        throw new Error(
            `combineNodes: ${currentValue.name} contains: "type Query" replace with "extend type Query"`
        );
    }

    if (typeMutation) {
        throw new Error(
            `combineNodes: ${currentValue.name} contains: "type Mutation" replace with "extend type Mutation"`
        );
    }

    if (typeSubscription) {
        throw new Error(
            `combineNodes: ${currentValue.name} contains: "type Subscription" replace with "extend type Subscription"`
        );
    }

    const [
        extendTypeQuery,
        extendTypeMutation,
        extendTypeSubscription
    ] = typeDefsExtendsRootTypes(currentValue.typeDefs);

    if (extendTypeQuery) {
        result.haveSeenExtendTypeQuery = true;
    }

    if (extendTypeMutation) {
        result.haveSeenExtendTypeMutation = true;
    }

    if (extendTypeSubscription) {
        result.haveSeenExtendTypeSubscription = true;
    }

    result.typeDefs = `${result.typeDefs}\n${currentValue.typeDefs}`;

    result.resolvers.Query = {
        ...result.resolvers.Query,
        ...(currentValue.resolvers.Query || {})
    };

    result.resolvers.Mutation = {
        ...result.resolvers.Mutation,
        ...(currentValue.resolvers.Mutation || {})
    };

    result.resolvers.Subscription = {
        ...result.resolvers.Subscription,
        ...(currentValue.resolvers.Subscription || {})
    };

    result.resolvers[currentValue.name] = currentValue.resolvers.Fields || {};

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
 * @typedef {Object} Schema
 * @property {string} typeDefs - graphql typeDefs
 * @property {Object} resolvers - graphql resolvers
 * @property {Object} resolvers.Query - graphql resolvers.Query
 * @property {Object} resolvers.Mutation - graphql resolvers.Mutation
 * @property {Object} resolvers.Subscription - graphql resolvers.Subscription
 */

/**
 * Combines and returns the combined typeDefs and resolvers, ready to be passed into apollo-server, graphQL-yoga & more.
 *
 * @param {Array.<GraphQLNode>} nodes - Array of type GraphQLNode.
 *
 * @returns {Schema}
 */
async function combineNodes(nodes) {
    if (!nodes) {
        throw new Error("combineNodes: nodes required");
    }

    if (!Array.isArray(nodes)) {
        throw new Error(
            `combineNodes: expected nodes to be of type array recived ${typeof nodes}`
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

    if (haveSeenExtendTypeQuery) {
        typeDefs += "\n type Query";
    }

    if (haveSeenExtendTypeMutation) {
        typeDefs += "\n type Mutation";
    }

    if (haveSeenExtendTypeSubscription) {
        typeDefs += "\n type Subscription";
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
