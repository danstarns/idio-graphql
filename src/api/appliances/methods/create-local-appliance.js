/* eslint-disable consistent-return */
const safeJsonStringify = require("safe-json-stringify");
const IdioEnum = require("../idio-enum.js");
const IdioUnion = require("../idio-union.js");
const IdioInterface = require("../idio-interface.js");
const IdioError = require("../../idio-error.js");

/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 *
 * @param {Object} options
 * @param {string} options.type
 * @param {ServiceBroker} options.broker
 */
function createLocalAppliance({ type, broker }) {
    return function _createLocalAppliance(introspection) {
        if (type === "enums") {
            return new IdioEnum({
                ...introspection
            });
        }

        function __resolveType(...graphQLArgs) {
            try {
                return broker.call(`${introspection.name}.__resolveType`, {
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
