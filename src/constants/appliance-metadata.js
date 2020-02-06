const {
    IdioScalar,
    IdioEnum,
    IdioDirective,
    IdioUnion,
    IdioInterface
} = require("../api/appliances/index.js");

const APPLIANCE_METADATA = [
    {
        _Constructor: IdioScalar,
        kind: "ScalarTypeDefinition",
        singular: "scalar",
        name: "scalars"
    },
    {
        _Constructor: IdioEnum,
        kind: "EnumTypeDefinition",
        singular: "enum",
        name: "enums"
    },
    {
        _Constructor: IdioDirective,
        kind: "DirectiveDefinition",
        singular: "directive",
        name: "directives"
    },
    {
        singular: "schemaGlobal",
        name: "schemaGlobals"
    },
    {
        _Constructor: IdioUnion,
        kind: "UnionTypeDefinition",
        singular: "union",
        name: "unions"
    },
    {
        _Constructor: IdioInterface,
        kind: "InterfaceTypeDefinition",
        singular: "interface",
        name: "interfaces"
    }
];

module.exports = APPLIANCE_METADATA;
