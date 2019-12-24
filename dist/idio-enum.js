"use strict";

const {
  parseTypeDefs
} = require("./util/index.js");
/**
 * @typedef {Object} IdioEnum
 * @property {string} name - The Enum name.
 * @property {Promise<string>} typeDefs - Graphql typeDefs resolver.
 * @property {Object} resolver - The Enum resolver.
 */

/**
 * Creates a instance of IdioEnum.
 *
 * @param {Object} config
 * @param {string} config.name - The Enum name.
 * @param {string} config.typeDefs - Graphql typedefs, use filePath, string, or gql-tag.
 * @param {Object} config.resolver - The Enum resolver.
 *
 * @returns IdioEnum
 */


function IdioEnum({
  name,
  typeDefs,
  resolver
} = {}) {
  this.name;
  this.typeDefs;
  this.resolver;

  if (!name) {
    throw new Error("IdioEnum: name required");
  }

  if (typeof name !== "string") {
    throw new Error("IdioEnum: name must be of type 'string'");
  }

  this.name = name;

  if (!typeDefs) {
    throw new Error(`IdioEnum: creating Enum: '${name}' typeDefs required`);
  }

  try {
    this.typeDefs = parseTypeDefs(typeDefs);
  } catch (error) {
    throw new Error(`IdioEnum: creating Enum: '${name}' Error: ${error}`);
  }

  if (!resolver) {
    throw new Error(`IdioEnum: creating Enum: '${name}' without a resolver`);
  }

  this.resolver = resolver;
}

module.exports = IdioEnum;