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
 * @param {Object} options
 * @param {string} options.type
 * @param {ServiceBroker} options.broker
 * @param {Object} options.serviceManagers
 */
function createLocalAppliance({ type, broker, serviceManagers }) {
    const metadata = APPLIANCE_METADATA.find((x) => x.name === type);
    const serviceTypeManagers = serviceManagers[metadata.plural];

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
            } catch (error) {
                throw new IdioError(
                    `${introspection.name}.__resolveType failed: Error:\n${error}`
                );
            }
        }

        if (type === "unions") {
            return new IdioUnion({
                ...introspection,
                resolver: { __resolveType }
            });
        }

        if (type === "interfaces") {
            return new IdioInterface({
                ...introspection,
                resolver: { __resolveType }
            });
        }
    };
}

module.exports = createLocalAppliance;
