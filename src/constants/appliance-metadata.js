const {
    IdioScalar,
    IdioEnum,
    IdioDirective,
    IdioUnion,
    IdioInterface
} = require("../api/appliances/index.js");

/**
 * @typedef {import('../api/appliances/index.js').IdioScalar} IdioScalar
 * @typedef {import('../api/appliances/index.js').IdioEnum} IdioEnum
 * @typedef {import('../api/appliances/index.js').IdioDirective} IdioDirective
 * @typedef {import('../api/appliances/index.js').IdioUnion} IdioUnion
 * @typedef {import('../api/appliances/index.js').IdioInterface} IdioInterface
 */

/**
 * @typedef Metadata
 * @property {(IdioScalar | IdioEnum | IdioDirective | IdioUnion | IdioInterface)} _Constructor
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
    }
];

module.exports = APPLIANCE_METADATA;
