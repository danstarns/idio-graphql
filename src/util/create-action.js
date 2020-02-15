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

        const decodedArgs = JSON.parse(graphQLArgs);

        if (!decodedArgs[contextIndex]) {
            decodedArgs[contextIndex] = {};
        }

        if (!decodedArgs[contextIndex].injections) {
            decodedArgs[contextIndex].injections = {};
        }

        decodedArgs[contextIndex].injections.broker = broker;

        decodedArgs[contextIndex].injections.execute = execute.withBroker(
            RUNTIME
        );

        let result;

        if (method.subscribe) {
            result = iteratorToStream(method.subscribe(...decodedArgs));
        } else {
            result = await method(...decodedArgs);
        }

        return result;
    };
};
