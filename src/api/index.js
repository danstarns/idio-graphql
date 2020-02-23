/* eslint-disable global-require */
const {
    IdioDirective,
    IdioEnum,
    IdioInterface,
    IdioScalar,
    IdioUnion
} = require("./appliances/index.js");

module.exports = {
    GraphQLNode: require("./graphql_node/graphql-node.js"),
    combineNodes: require("./combine_nodes/combine-nodes.js"),
    GraphQLGateway: require("./graphql_gateway/graphql-gateway.js"),
    IdioDirective,
    IdioEnum,
    IdioInterface,
    IdioScalar,
    IdioUnion
};
