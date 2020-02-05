const execute = require("./execute.js");
const iteratorToStream = require("./iterator-to-stream.js");

/**
 * @typedef {import('moleculer').Context} Context
 */

/**
 * @param {function} method
 * @param {Object} RUNTIME
 */
module.exports = ({ method, contextIndex }, RUNTIME) => {
    const { broker } = RUNTIME;

    /**
     * @param {Context} ctx
     */
    return async function createAction(ctx) {
        const { params: { graphQLArgs = JSON.stringify([]) } = {} } = ctx;

        const decodedArgs = JSON.parse(graphQLArgs);

        const context = decodedArgs[contextIndex];

        if (!context) {
            decodedArgs[contextIndex] = {};
        }

        decodedArgs[contextIndex].broker = broker;
        decodedArgs[contextIndex].broker.gql = {
            execute: execute(RUNTIME)
        };

        let result;

        if (method.subscribe) {
            result = iteratorToStream(method.subscribe(...decodedArgs));
        }

        result = await method(...decodedArgs);

        return result;
    };
};
