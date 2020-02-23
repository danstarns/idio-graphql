const GraphQLNode = require("./graphql_node/graphql-node.js");
const combineNodes = require("./combine_nodes/combine-nodes.js");
const GraphQLGateway = require("./graphql_gateway/graphql-gateway.js");

const appliances = require("./appliances/index.js");

const api = {
    GraphQLNode,
    combineNodes,
    GraphQLGateway,
    ...appliances
};

module.exports = api;
