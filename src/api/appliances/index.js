const IdioEnum = require("./idio-enum.js");
const IdioScalar = require("./idio-scalar.js");
const IdioDirective = require("./idio-directive.js");
const IdioUnion = require("./idio-union.js");
const IdioInterface = require("./idio-interface.js");

/**
 * @typedef {import('./idio-scalar.js')} IdioScalar
 * @typedef {import('./idio-enum.js')} IdioEnum
 * @typedef {import('./idio-directive.js')} IdioDirective
 * @typedef {import('./idio-interface')} IdioInterface
 * @typedef {import('./idio-union.js')} IdioUnion
 */

/**
 * @typedef {Object} appliances
 * @property {Array.<IdioScalar>} scalars
 * @property {Array.<IdioEnum>} enums
 * @property {Array.<IdioDirective>} directives
 * @property {Array.<IdioInterface>} interfaces
 * @property {Array.<IdioUnion>} unions
 * @property {any} schemaGlobals - an Array or a single instance of Graphql typeDefs, use filePath, string, or gql-tag.
 */

module.exports = {
    IdioEnum,
    IdioScalar,
    IdioDirective,
    IdioUnion,
    IdioInterface
};
