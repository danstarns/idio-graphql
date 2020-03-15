/* eslint-disable consistent-return */
const safeJsonStringify = require("safe-json-stringify");
const IdioEnum = require("../idio-enum.js");
const IdioUnion = require("../idio-union.js");
const IdioInterface = require("../idio-interface.js");
const IdioScalar = require("../idio-scalar.js");
const IdioDirective = require("../idio-directive.js");
const GraphQLType = require("../graphql-type.js");
const IdioError = require("../../idio-error.js");

const APPLIANCE_METADATA = [
    {
        _Constructor: IdioScalar,
        kind: "ScalarTypeDefinition",
        singular: "scalar",
        name: "scalars"
    },
    {
        _Constructor: IdioEnum,
        kind: "EnumTypeDefinition",
        singular: "enum",
        name: "enums"
    },
    {
        _Constructor: IdioDirective,
        kind: "DirectiveDefinition",
        singular: "directive",
        name: "directives"
    },
    {
        singular: "schemaGlobal",
        name: "schemaGlobals"
    },
    {
        _Constructor: IdioUnion,
        kind: "UnionTypeDefinition",
        singular: "union",
        name: "unions"
    },
    {
        _Constructor: IdioInterface,
        kind: "InterfaceTypeDefinition",
        singular: "interface",
        name: "interfaces"
    },
    {
        _Constructor: GraphQLType,
        kind: "ObjectTypeDefinition", // Currently there is a overlap between this & GraphQLNode
        singular: "type",
        name: "types"
    }
];

/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 *
 * @param {object} options
 * @param {string} options.type
 * @param {ServiceBroker} options.broker
 * @param {object} options.serviceManagers
 */
function createLocalAppliance({ type, broker, serviceManagers }) {
    if (
        type !== "enums" &&
        type !== "unions" &&
        type !== "interfaces" &&
        type !== "types"
    ) {
        throw new IdioError("invalid type");
    }

    const metadata = APPLIANCE_METADATA.find((x) => x.name === type);
    const serviceTypeManagers = serviceManagers[metadata.singular];

    return function _createLocalAppliance(introspection) {
        const instanceServiceManager = serviceTypeManagers[introspection.name];

        if (type === "enums") {
            return new IdioEnum({
                ...introspection
            });
        }

        function typeResolver(method) {
            return async (...graphQLArgs) => {
                try {
                    const serviceToCall = await instanceServiceManager.getNextService();

                    if (!serviceToCall) {
                        throw new IdioError(
                            `No service with name: '${introspection.name}' online`
                        );
                    }

                    return broker.call(`${serviceToCall}.${method}`, {
                        graphQLArgs: safeJsonStringify(graphQLArgs)
                    });
                } catch ({ message }) {
                    throw new IdioError(
                        `${introspection.name}.${method} failed, ${message}`
                    );
                }
            };
        }

        if (type === "types") {
            return new GraphQLType({
                ...introspection,
                resolvers: introspection.resolvers.reduce(
                    (result, key) => ({ ...result, [key]: typeResolver(key) }),
                    {}
                )
            });
        }

        async function __resolveType(...graphQLArgs) {
            try {
                const serviceToCall = await instanceServiceManager.getNextService();

                if (!serviceToCall) {
                    throw new IdioError(
                        `No service with name: '${introspection.name}' online.`
                    );
                }

                return broker.call(`${serviceToCall}.__resolveType`, {
                    graphQLArgs: safeJsonStringify(graphQLArgs)
                });
            } catch ({ message }) {
                throw new IdioError(
                    `${introspection.name}.__resolveType failed, ${message}`
                );
            }
        }

        if (type === "unions") {
            return new IdioUnion({
                ...introspection,
                resolver: { __resolveType }
            });
        }

        return new IdioInterface({
            ...introspection,
            resolver: { __resolveType }
        });
    };
}

module.exports = createLocalAppliance;
