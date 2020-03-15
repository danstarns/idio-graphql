const {
    IdioScalar,
    IdioEnum,
    IdioDirective,
    IdioUnion,
    IdioInterface,
    GraphQLType
} = require("../api/appliances/index.js");

/**
 * @typedef {import('../api/appliances/index.js').IdioScalar} IdioScalar
 * @typedef {import('../api/appliances/index.js').IdioEnum} IdioEnum
 * @typedef {import('../api/appliances/index.js').IdioDirective} IdioDirective
 * @typedef {import('../api/appliances/index.js').IdioUnion} IdioUnion
 * @typedef {import('../api/appliances/index.js').IdioInterface} IdioInterface
 * @typedef {import('../api/appliances/index.js').GraphQLType} GraphQLType
 */

/**
 * @typedef Metadata
 * @property {(IdioScalar | IdioEnum | IdioDirective | IdioUnion | IdioInterface | GraphQLType)} _Constructor
 * @property {string} kind
 * @property {string} singular
 * @property {string} name
 */

/** @type {Metadata[]} */
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
    },
    {
        _Constructor: GraphQLType,
        kind: "ObjectTypeDefinition", // Currently there is a overlap between this & GraphQLNode
        singular: "type",
        name: "types"
    }
];

module.exports = APPLIANCE_METADATA;
