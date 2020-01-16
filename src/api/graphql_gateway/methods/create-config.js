const IdioError = require("../../idio-error.js");
const GraphQLNode = require("../../graphql_node/graphql-node.js");
const { checkInstance } = require("../../../util/index.js");

const {
    IdioScalar,
    IdioEnum,
    IdioDirective
} = require("../../appliances/index.js");

/**
 * @typedef {import('../../graphql_node/graphql-node.js')} GraphQLNode
 * @typedef {import('../../appliances/idio-scalar.js')} IdioScalar
 * @typedef {import('../../appliances/idio-enum.js')} IdioEnum
 * @typedef {import('../../appliances/idio-directive.js')} IdioDirective
 */

/**
 * @typedef {Object} services
 * @property {Array.<string>} nodes
 * @property {Array.<string>} enums
 */

/**
 * @typedef {Object} locals
 * @property {Array.<GraphQLNode>} nodes
 * @property {Array.<IdioScalar>} scalars
 * @property {Array.<IdioEnum>} enums
 * @property {Array.<IdioDirective>} directives
 * @property {any} schemaGlobals - an Array or a single instance of GraphQL typeDefs, use filePath, string, or gql-tag.
 */

/**
 * @typedef {Object} config
 * @property {services} services
 * @property {locals} locals
 */

/**
 *
 * @param {services} services
 * @returns {services}
 */
function validateServices(services) {
    if (!services) {
        return false;
    }

    const { nodes, enums } = services;

    Object.entries({ nodes, enums }).forEach(([key, values]) => {
        if (values) {
            if (!Array.isArray(values)) {
                throw new IdioError(
                    `services.${key} must be of type Array|string].`
                );
            }

            values.forEach((value, index) => {
                if (!(typeof value === "string")) {
                    throw new IdioError(
                        `services.${key}[${index}] must be of type string.`
                    );
                }
            });
        }
    });

    return services;
}

/**
 *
 * @param {locals} locals
 * @returns {locals}
 */
function validateLocals(locals) {
    if (!locals) {
        return false;
    }

    const { nodes, enums, scalars, directives } = locals;

    Object.entries({
        nodes: { instances: nodes, of: GraphQLNode },
        enums: { instances: enums, of: IdioEnum },
        scalars: { instances: scalars, of: IdioScalar },
        directives: { instances: directives, of: IdioDirective }
    }).forEach(([key, { instances, of }]) => {
        if (instances) {
            if (!Array.isArray(instances)) {
                throw new IdioError(`locals.${key} must be of type array.`);
            }

            instances.forEach((instance, index) =>
                checkInstance({
                    instance,
                    of,
                    name: `locals.${key}[${index}]`
                })
            );
        }
    });

    return locals;
}

/**
 * @param {config} config
 */
function createConfig(config) {
    if (!config) {
        throw new IdioError("config required.");
    }

    if (!(typeof config === "object")) {
        throw new IdioError("config must be of type object.");
    }

    let services = validateServices(config.services) || {
        nodes: [],
        enums: []
    };

    let locals = validateLocals(config.locals) || {
        nodes: [],
        enums: [],
        scalars: [],
        directives: []
    };

    if (!services.nodes.length && !locals.nodes.length) {
        throw new IdioError(
            `Found no declared services, provide a list of local or remote services in the config object.`
        );
    }

    return {
        services,
        locals
    };
}

module.exports = createConfig;
