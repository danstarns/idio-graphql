const INDEX = require("../constants/context-index.js");

function injectGraphQLArgs({ graphQLArgs, injections }) {
    const args = [...graphQLArgs];

    if (injections && args.length) {
        if (!args[INDEX]) {
            args[INDEX] = {};
        }

        if (!args[INDEX].injections) {
            args[INDEX].injections = {};
        }

        if (!(typeof args[INDEX].injections === "object")) {
            throw new Error(`injections must be an object`);
        }

        args[INDEX].injections = {
            ...args[INDEX].injections,
            ...injections
        };
    }

    return args;
}

module.exports = injectGraphQLArgs;
