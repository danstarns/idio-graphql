"use strict";

const fs = require("fs");

const {
  parse,
  print
} = require("graphql/language");

const IdioError = require("../api/idio-error.js");
/**
 *
 * @param {(FilePath | string | GraphQLAST)} typeDefs - filePath, gql-tag or string.
 *
 * @returns {string} typeDefs - Graphql typeDefs resolver
 */


function parseTypeDefs(typeDefs) {
  if (typeof typeDefs === "string") {
    if (!fs.existsSync(typeDefs)) {
      try {
        parse(typeDefs);
        return typeDefs;
      } catch (error) {
        throw new IdioError(`cannot resolve typeDefs: '${error}'.`);
      }
    } else {
      return fs.readFileSync(typeDefs, "utf8");
    }
  } else if (typeof typeDefs === "object") {
    if (Object.keys(typeDefs).includes("kind")) {
      return print(typeDefs);
    }

    throw new IdioError(`cannot resolve typeDefs: ${JSON.stringify(typeDefs, null, 2)}.`);
  } else {
    throw new IdioError(`cannot parse typeDefs: ${typeDefs}.`);
  }
}

module.exports = parseTypeDefs;