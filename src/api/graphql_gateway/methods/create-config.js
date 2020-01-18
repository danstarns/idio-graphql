const IdioError = require("../../idio-error.js");
const GraphQLNode = require("../../graphql_node/graphql-node.js");
const { checkInstance } = require("../../../util/index.js");
const {
    IdioScalar,
    IdioEnum,
    IdioDirective,
    IdioInterface,
    IdioUnion
} = require("../../appliances/index.js");

/**
 * @typedef {import('../graphql-gateway.js').config} config
 * @typedef {import('../graphql-gateway.js').locals} locals
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

    if (!(typeof services === "object")) {
        throw new IdioError("services must be of type object.");
    }

    if (!Object.keys(services).length) {
        return false;
    }

    const { nodes, enums, interfaces, unions } = services;

    Object.entries({ nodes, enums, interfaces, unions }).forEach(
        ([key, values]) => {
            if (values) {
                if (!Array.isArray(values)) {
                    throw new IdioError(
                        `services.${key} must be of type Array.<string>.`
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
        }
    );

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

    if (!(typeof locals === "object")) {
        throw new IdioError("locals must be of type object.");
    }

    if (!Object.keys(locals).length) {
        return false;
    }

    const { nodes, enums, scalars, directives, interfaces, unions } = locals;

    Object.entries({
        nodes: { instances: nodes, of: GraphQLNode },
        enums: { instances: enums, of: IdioEnum },
        scalars: { instances: scalars, of: IdioScalar },
        directives: { instances: directives, of: IdioDirective },
        interfaces: { instances: interfaces, of: IdioInterface },
        unions: { instances: unions, of: IdioUnion }
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
        enums: [],
        interfaces: [],
        unions: []
    };

    let locals = validateLocals(config.locals) || {
        nodes: [],
        enums: [],
        scalars: [],
        directives: [],
        interfaces: [],
        unions: []
    };

    if (!services.nodes.length && !locals.nodes.length) {
        throw new IdioError(
            `Found no declared nodes, provide a list of local or remote nodes.`
        );
    }

    return {
        services,
        locals
    };
}

module.exports = createConfig;
