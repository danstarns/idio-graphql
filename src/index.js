/* eslint-disable global-require */
require("core-js");
require("regenerator-runtime/runtime");

module.exports = {
    GraphQLNode: require("./api/graphql_node/graphql-node.js"),
    combineNodes: require("./api/combine_nodes/combine-nodes.js"),
    GraphQLGateway: require("./api/graphql_gateway/graphql-gateway.js"),
    IdioDirective: require("./api/appliances/idio-directive.js"),
    IdioEnum: require("./api/appliances/idio-enum.js"),
    IdioInterface: require("./api/appliances/idio-interface.js"),
    IdioScalar: require("./api/appliances/idio-scalar.js"),
    IdioUnion: require("./api/appliances/idio-union.js"),
    GraphQLType: require("./api/appliances/graphql-type.js")
};
