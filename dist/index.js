/* eslint-disable import/no-extraneous-dependencies */
require("core-js/stable");

require("regenerator-runtime/runtime");

const {
    IdioDirective,
    IdioEnum,
    IdioInterface,
    IdioScalar,
    IdioUnion
} = require("./api/appliances/index.js");

module.exports = {
    GraphQLNode: require("./api/graphql_node/graphql-node.js"),
    combineNodes: require("./api/combine_nodes/combine-nodes.js"),
    GraphQLGateway: require("./api/graphql_gateway/graphql-gateway.js"),
    IdioDirective,
    IdioEnum,
    IdioInterface,
    IdioScalar,
    IdioUnion
};
