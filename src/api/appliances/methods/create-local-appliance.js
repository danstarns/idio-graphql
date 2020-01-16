/* eslint-disable consistent-return */
/* eslint-disable default-case */
const IdioEnum = require("../idio-enum.js");
const IdioUnion = require("../idio-union.js");
const IdioInterface = require("../idio-interface.js");

function createLocalEnum() {
    return (introspection) => {
        return new IdioEnum({
            ...introspection
        });
    };
}

/**
 * @param {Object} options
 * @param {string} options.type
 */
function createLocalAppliance({ type, broker }) {
    switch (type) {
        case "enums":
            return createLocalEnum();
        case "unions":
        case "interfaces":
            return function _createLocalAppliance(introspection) {
                let _constructor;

                if (type === "unions") {
                    _constructor = IdioUnion;
                } else if (type === "interfaces") {
                    _constructor = IdioInterface;
                }

                return new _constructor({
                    ...introspection,
                    resolver: {
                        __resolveType: (...args) => {
                            return broker.call(
                                `${introspection.name}.__resolveType`,
                                { graphQLArgs: args }
                            );
                        }
                    }
                });
            };
    }
}

module.exports = createLocalAppliance;
