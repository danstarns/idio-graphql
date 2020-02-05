const {
    IdioScalar,
    IdioEnum,
    IdioDirective,
    IdioUnion,
    IdioInterface
} = require("../api/appliances/index.js");

const APPLIANCE_METADATA = [
    {
        applianceConstructor: IdioScalar,
        kind: "ScalarTypeDefinition",
        singular: "scalar",
        name: "scalars"
    },
    {
        applianceConstructor: IdioEnum,
        kind: "EnumTypeDefinition",
        singular: "enum",
        name: "enums"
    },
    {
        applianceConstructor: IdioDirective,
        kind: "DirectiveDefinition",
        singular: "directive",
        name: "directives"
    },
    {
        singular: "schemaGlobal",
        name: "schemaGlobals"
    },
    {
        applianceConstructor: IdioUnion,
        kind: "UnionTypeDefinition",
        singular: "union",
        name: "unions"
    },
    {
        applianceConstructor: IdioInterface,
        kind: "InterfaceTypeDefinition",
        singular: "interface",
        name: "interfaces"
    }
];

module.exports = APPLIANCE_METADATA;
