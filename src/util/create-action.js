const execute = require("./execute.js");
const iteratorToStream = require("./iterator-to-stream.js");

/**
 * @typedef {import('moleculer').Context} Context
 * @typedef {import('./execute.js').execute} execute
 */

/**
 * @param {function} method
 * @param {Object} RUNTIME
 */
module.exports = ({ method, contextIndex }, RUNTIME) => {
    const { broker } = RUNTIME;

    return async function createAction(/** @type {Context} */ ctx) {
        const { params: { graphQLArgs = JSON.stringify([]) } = {} } = ctx;

        const args = JSON.parse(graphQLArgs);

        if (!args[contextIndex]) {
            args[contextIndex] = {};
        }

        if (!args[contextIndex].injections) {
            args[contextIndex].injections = {};
        }

        args[contextIndex].injections.broker = broker;

        args[contextIndex].injections.execute = execute.withBroker(RUNTIME);

        let result;

        if (method.subscribe) {
            result = iteratorToStream(method.subscribe(...args));
        } else {
            result = await method(...args);
        }

        return result;
    };
};
