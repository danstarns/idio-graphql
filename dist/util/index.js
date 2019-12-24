"use strict";

const parseTypeDefs = require("./parse-typedefs.js");

const graphQLLoader = require("./graphql-loader.js");

const extractResolvers = require("./extract-resolvers.js");

module.exports = {
  parseTypeDefs,
  graphQLLoader,
  extractResolvers
};