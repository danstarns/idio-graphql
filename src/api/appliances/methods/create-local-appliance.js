/* eslint-disable consistent-return */
const safeJsonStringify = require("safe-json-stringify");
const IdioEnum = require("../idio-enum.js");
const IdioUnion = require("../idio-union.js");
const IdioInterface = require("../idio-interface.js");
const IdioError = require("../../idio-error.js");
const APPLIANCE_METADATA = require("../../../constants/appliance-metadata.js");

/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 *
 * @param {object} options
 * @param {string} options.type
 * @param {ServiceBroker} options.broker
 * @param {object} options.serviceManagers
 */
function createLocalAppliance({ type, broker, serviceManagers }) {
    if (type !== "enums" && type !== "unions" && type !== "interfaces") {
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
