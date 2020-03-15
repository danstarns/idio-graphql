const IdioEnum = require("./idio-enum.js");
const IdioScalar = require("./idio-scalar.js");
const IdioDirective = require("./idio-directive.js");
const IdioUnion = require("./idio-union.js");
const IdioInterface = require("./idio-interface.js");
const GraphQLType = require("./graphql-type.js");

/**
 * @typedef {import('./idio-scalar.js').IdioScalar} IdioScalar
 * @typedef {import('./idio-enum.js').IdioEnum} IdioEnum
 * @typedef {import('./idio-directive.js').IdioDirective} IdioDirective
 * @typedef {import('./idio-interface').IdioInterface} IdioInterface
 * @typedef {import('./idio-union.js').IdioUnion} IdioUnion
 * @typedef {import('./graphql-type.js').GraphQLType} GraphQLType
 */

/**
 * @typedef appliances
 * @property {IdioScalar[]} scalars
 * @property {IdioEnum[]} enums
 * @property {IdioDirective[]} directives
 * @property {IdioInterface[]} interfaces
 * @property {IdioUnion[]} unions
 * @property {GraphQLType[]} types
 * @property {any} schemaGlobals - an Array or a single instance of Graphql typeDefs, use filePath, string, or gql-tag.
 */

const appliances = {
    IdioEnum,
    IdioScalar,
    IdioDirective,
    IdioUnion,
    IdioInterface,
    GraphQLType
};

module.exports = appliances;
