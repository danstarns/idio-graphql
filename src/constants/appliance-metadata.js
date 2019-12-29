const IdioScalar = require("../idio-scalar.js");
const IdioEnum = require("../idio-enum.js");
const IdioDirective = require("../idio-directive.js");

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
    }
];

module.exports = APPLIANCE_METADATA;
