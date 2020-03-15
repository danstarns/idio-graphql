const {
    parseTypeDefs,
    validateTypeDefs,
    wrappedResolver,
    isFunction
} = require(`../../util/index.js`);
const { parse } = require("graphql/language");

const serveAppliance = require("./methods/serve-appliance.js");
const IdioError = require("../idio-error.js");
const RESTRICTED_NAMES = require("../../constants/restricted-names.js");

/**
 * @typedef {import('moleculer').BrokerOptions} BrokerOptions
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('graphql').DocumentNode} DocumentNode
 * @typedef {import('../../util/wrapped-resolver.js').ResolverUnion} ResolverUnion
 */

/**
 * @typedef {{
 *      name: string,
 *      typeDefs: string | DocumentNode,
 *      resolvers: Object<string, ResolverUnion>,
 *      injections: Object<string, any>
 * }} GraphQLTypeInput
 */

/**
 * @typedef {{
 *      name: string,
 *      typeDefs: string,
 *      resolvers: Object<string, function>,
 *      injections: Object<string, any>,
 *      serve: (brokerOptions: BrokerOptions) => Promise<ServiceBroker>
 * }} GraphQLType
 */

/**
 * You can use GraphQLType to modularize a ObjectTypeDefinition, together with its Field resolvers.
 *
 * You can specify types 'top-level' at combineNodes or at an GraphQLNode level.
 *
 * @param {GraphQLTypeInput} input
 * @returns {GraphQLType}
 */
function GraphQLType({ name, typeDefs, resolvers, injections } = {}) {
    const prefix = `constructing GraphQLType`;

    this.name;
    this.typeDefs;
    this.resolvers;
    this.injections = injections;

    if (!name) {
        throw new IdioError(`${prefix} name required.`);
    }

    if (typeof name !== `string`) {
        throw new IdioError(`${prefix} name must be of type 'string'.`);
    }

    if (RESTRICTED_NAMES[name.toLowerCase()]) {
        throw new IdioError(`${prefix}: '${name}' with invalid name.`);
    }

    this.name = name;

    if (!typeDefs) {
        throw new IdioError(`${prefix}: '${name}' typeDefs required.`);
    }

    try {
        this.typeDefs = parseTypeDefs(typeDefs);
    } catch (error) {
        throw new IdioError(`${prefix}: '${name}' \n${error}.`);
    }

    this.typeDefs = validateTypeDefs(this, {
        _Constructor: GraphQLType,
        kind: "ObjectTypeDefinition", // Currently there is a overlap between this & GraphQLNode
        singular: "type",
        name: "types"
    });

    if (!resolvers) {
        throw new IdioError(`${prefix}: '${name}' resolvers required.`);
    }

    if (!Object.keys(resolvers).length) {
        throw new IdioError(
            `${prefix}: ${name} at least one resolver required`
        );
    }

    this.resolvers = Object.entries(resolvers).reduce(
        (result, [key, method]) => {
            let wrappedMethod;

            if (isFunction(method)) {
                wrappedMethod = wrappedResolver(method, {
                    name: `${this.name}.resolvers.${key}`,
                    injections: this.injections
                });
            } else if (Object.keys(method).includes("resolve")) {
                const { pre, resolve, post } = method;

                wrappedMethod = wrappedResolver(resolve, {
                    pre,
                    post,
                    injections: this.injections,
                    name: `${this.name}.resolvers.${key}`
                });
            } else {
                throw new IdioError(
                    `${prefix}: ${name}.resolver.${key} requires a 'resolve' method`
                );
            }

            return {
                ...result,
                [key]: wrappedMethod
            };
        },
        {}
    );

    const ast = parse(this.typeDefs);

    const nodeAst = ast.definitions
        .filter(({ kind }) => kind === "ObjectTypeDefinition")
        .find(({ name: { value } }) => value === this.name);

    const nodeFields = nodeAst.fields.map((field) => field.name.value);

    Object.keys(this.resolvers).forEach((key) => {
        if (!nodeFields.includes(key)) {
            throw new IdioError(
                `${prefix}: ${name}.${key} not defined in typeDefs`
            );
        }
    });
}

GraphQLType.prototype.serve = serveAppliance({
    _Constructor: GraphQLType,
    kind: "ObjectTypeDefinition",
    singular: "type",
    name: "types"
});

module.exports = GraphQLType;
