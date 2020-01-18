const {
    IdioScalar,
    IdioEnum,
    IdioDirective,
    IdioUnion,
    IdioInterface
} = require("../api/appliances/index.js");
const GraphQLNode = require("../api/graphql_node/graphql-node.js");

const APPLIANCE_METADATA = [
    {
        applianceConstructor: IdioScalar,
        kind: "ScalarTypeDefinition",
        plural: "scalar",
        name: "scalars"
    },
    {
        applianceConstructor: IdioEnum,
        kind: "EnumTypeDefinition",
        plural: "enum",
        name: "enums"
    },
    {
        applianceConstructor: IdioDirective,
        kind: "DirectiveDefinition",
        plural: "directive",
        name: "directives"
    },
    {
        plural: "schemaGlobal",
        name: "schemaGlobals"
    },
    {
        applianceConstructor: IdioUnion,
        kind: "UnionTypeDefinition",
        plural: "union",
        name: "unions"
    },
    {
        applianceConstructor: IdioInterface,
        kind: "InterfaceTypeDefinition",
        plural: "interface",
        name: "interfaces"
    },
    {
        applianceConstructor: GraphQLNode,
        kind: "ObjectTypeDefinition",
        plural: "node",
        name: "nodes"
    }
];

module.exports = APPLIANCE_METADATA;
