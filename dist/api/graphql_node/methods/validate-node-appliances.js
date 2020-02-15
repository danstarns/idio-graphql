"use strict";

require("core-js/modules/es.array.iterator");

const APPLIANCE_METADATA = require("../../../constants/appliance-metadata.js");

const IdioError = require("../../idio-error.js");
/** @typedef {import('../graphql-node.js').GraphQLNode} GraphQLNode */

/** @typedef {import('../../appliances/idio-enum.js').IdioEnum} IdioEnum */

/** @typedef {import('../../appliances/idio-interface.js').IdioInterface} IdioInterface */

/** @typedef {import('../../appliances/idio-union.js').IdioUnion} IdioUnion */

/**
 * @param {GraphQLNode} node
 * @returns {(
 *  options: {
 *        name: string,
 *        enums: IdioEnum[],
 *        interfaces: IdioInterface[],
 *        unions: IdioUnion[],
 *        nodes: GraphQLNode[]
 *  }) => void
 * }
 */


module.exports = GraphQLNode => {
  return function validateNodeAppliances({
    name,
    enums,
    interfaces,
    unions,
    nodes
  }) {
    const prefix = "constructing GraphQLNode";
    Object.entries({
      enums,
      interfaces,
      unions,
      nodes
    }).forEach(([key, appliances]) => {
      if (appliances) {
        if (!Array.isArray(appliances)) {
          throw new IdioError(`${prefix}: '${name}' ${key} must be of type 'array'.`);
        }

        const {
          singular,
          _Constructor
        } = [...APPLIANCE_METADATA, {
          _Constructor: GraphQLNode,
          kind: "ObjectTypeDefinition",
          singular: "node",
          name: "nodes"
        }].find(x => x.name === key);

        function checkInstanceOfAppliance(appliance) {
          if (!(appliance instanceof _Constructor)) {
            throw new IdioError(`${prefix}: '${name}' expected ${singular} to be instance of '${_Constructor.name}'.`);
          }
        }

        appliances.forEach(checkInstanceOfAppliance);
      }
    });
  };
};