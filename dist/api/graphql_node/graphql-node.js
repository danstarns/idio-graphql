"use strict";

require("core-js/modules/es.array.iterator");

const {
  parseTypeDefs,
  validateTypeDefs
} = require("../../util/index.js");

const RESTRICTED_NAMES = require("../../constants/restricted-names.js");

const IdioError = require("../idio-error.js");

const {
  validateDefinitions,
  wrapResolvers,
  validateNodeAppliances,
  serve
} = require("./methods/index.js");
/**
 * @typedef {import('../appliances/idio-enum.js')} IdioEnum
 * @typedef {import('../appliances/idio-interface.js')} IdioInterface
 * @typedef {import('../appliances/idio-union.js')} IdioUnion
 * @typedef {import('../../util/wrapped-resolver.js').ResolverUnion} ResolverUnion
 * @typedef {import('./methods/serve.js').Runtime} Runtime
 */

/**
 * @typedef Resolvers
 * @property {Object.<string, ResolverUnion>} Query
 * @property {Object.<string, ResolverUnion>} Mutation
 * @property {Object.<string, {subscribe: Function}>} Subscription
 * @property {Object.<string, ResolverUnion>} Fields
 */

/**
 * @typedef {{dataLoaders: object, models: object}} injections
 */

/**
 * @typedef GraphQLNode
 * @property {string} name
 * @property {string} typeDefs
 * @property {Resolvers} resolvers
 * @property {GraphQLNode[]} nodes
 * @property {injections} injections
 * @property {IdioEnum[]} enums
 * @property {IdioInterface[]} interfaces
 * @property {IdioUnion[]} unions
 * @property {(brokerOptions: IdioBrokerOptions) => Runtime} serve
 */

/**
 * @typedef GraphQLNodeInput
 * @property {string} name
 * @property {any} typeDefs - gql-tag, string or filePath.
 * @property {Resolvers} resolvers
 * @property {GraphQLNode[]} nodes
 * @property {injections} injections
 * @property {IdioEnum[]} enums
 * @property {IdioInterface[]} interfaces
 * @property {IdioUnion[]} unions
 */

/**
 * You can use GraphQLNode to modularize an ObjectTypeDefinition together with its related resolvers & properties.
 *
 * @param {GraphQLNodeInput} config
 *
 * @returns {GraphQLNode}
 */


function GraphQLNode(config = {}) {
  const {
    name,
    typeDefs,
    resolvers,
    nodes,
    injections,
    enums,
    interfaces,
    unions
  } = config;
  const prefix = "constructing GraphQLNode";
  this.name;
  this.typeDefs;
  this.resolvers;
  this.nodes;
  this.injections;
  this.enums;
  this.interfaces;
  this.unions;
  this.serve;

  if (!name) {
    throw new IdioError(`${prefix}: name required.`);
  }

  if (typeof name !== `string`) {
    throw new IdioError(`${prefix}: name must be of type 'string'.`);
  }

  if (RESTRICTED_NAMES[name.toLowerCase()]) {
    throw new IdioError(`${prefix}: creating node '${name}' with invalid name.`);
  }

  this.name = name;

  if (!typeDefs) {
    throw new IdioError(`${prefix}: '${name}' typeDefs required.`);
  }

  try {
    this.typeDefs = parseTypeDefs(typeDefs);
  } catch (error) {
    throw new IdioError(`${prefix}: '${name}' Error: '${error}'.`);
  }

  this.typeDefs = validateTypeDefs(this, {
    _Constructor: GraphQLNode,
    kind: "ObjectTypeDefinition",
    singular: "node",
    name: "nodes"
  });

  if (injections) {
    this.injections = injections;
  }

  if (!resolvers) {
    throw new IdioError(`${prefix}: '${name}' resolvers required.`);
  }

  this.resolvers = resolvers;
  validateDefinitions(this);
  this.resolvers = wrapResolvers(this);
  Object.entries({
    nodes,
    enums,
    interfaces,
    unions
  }).forEach(([key, value]) => {
    if (value) {
      this[key] = value;
    }
  });
  validateNodeAppliances(GraphQLNode)(this);
}

GraphQLNode.prototype.serve = serve;
module.exports = GraphQLNode;