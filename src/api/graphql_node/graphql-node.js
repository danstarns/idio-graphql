const { parseTypeDefs, validateTypeDefs } = require("../../util/index.js");
const RESTRICTED_NAMES = require("../../constants/restricted-names.js");
const IdioError = require("../idio-error.js");
const {
    validateDefinitions,
    wrapResolvers,
    serve
} = require("./methods/index.js");
const APPLIANCE_METADATA = require("../../constants/appliance-metadata.js");

/**
 * @typedef {import('../appliances/idio-enum.js').IdioEnum} IdioEnum
 * @typedef {import('../appliances/idio-interface.js').IdioInterface} IdioInterface
 * @typedef {import('../appliances/idio-union.js').IdioUnion} IdioUnion
 * @typedef {import('../appliances/graphql-type.js').GraphQLType} GraphQLType
 * @typedef {import('../../util/wrapped-resolver.js').ResolverUnion} ResolverUnion
 * @typedef {import('./methods/serve.js').Runtime} Runtime
 * @typedef {import('../../util/execute.js').execute} execute
 */

/**
 * @typedef Resolvers
 * @property {Object.<string, ResolverUnion>} Query
 * @property {Object.<string, ResolverUnion>} Mutation
 * @property {Object.<string, {subscribe: Function}>} Subscription
 * @property {Object.<string, ResolverUnion>} Fields
 */

/**
 * @typedef {{
 *      dataLoaders: object,
 *      models: object,
 *      execute: execute
 * }} injections
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
 * @property {GraphQLType[]} types
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
 * @property {GraphQLType[]} types
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
        unions,
        types
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
    this.types;
    this.serve;

    if (!name) {
        throw new IdioError(`${prefix}: name required.`);
    }

    if (typeof name !== `string`) {
        throw new IdioError(`${prefix}: name must be of type 'string'.`);
    }

    if (RESTRICTED_NAMES[name.toLowerCase()]) {
        throw new IdioError(
            `${prefix}: creating node '${name}' with invalid name.`
        );
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

    Object.entries({ nodes, enums, interfaces, unions, types }).forEach(
        ([key, value]) => {
            if (value) {
                this[key] = value;
            }
        }
    );

    Object.entries({
        enums: this.enums,
        interfaces: this.interfaces,
        unions: this.unions,
        nodes: this.nodes,
        types: this.types
    }).forEach(([key, appliances]) => {
        if (appliances) {
            if (!Array.isArray(appliances)) {
                throw new IdioError(
                    `${prefix}: '${name}' ${key} must be of type 'array'.`
                );
            }

            const { singular, _Constructor } = [
                ...APPLIANCE_METADATA,
                {
                    _Constructor: GraphQLNode,
                    kind: "ObjectTypeDefinition", // Currently there is a overlap between this & GraphQLType, this is applied here due to a circ module reference :/
                    singular: "node",
                    name: "nodes"
                }
            ].find((x) => x.name === key);

            function checkInstanceOfAppliance(appliance) {
                if (!(appliance instanceof _Constructor)) {
                    throw new IdioError(
                        `${prefix}: '${name}' expected ${singular} to be instance of '${_Constructor.name}'.`
                    );
                }
            }

            appliances.forEach(checkInstanceOfAppliance);
        }
    });
}

GraphQLNode.prototype.serve = serve;

module.exports = GraphQLNode;
