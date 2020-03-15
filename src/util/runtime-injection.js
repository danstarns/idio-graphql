const execute = require("./execute.js");
const CONTEXT_INDEX = require("../constants/context-index.js");

function runtimeInjection(methods, RUNTIME) {
    return Object.entries(methods).reduce((result, [key, method]) => {
        const createArgs = (graphQLArgs) => {
            if (!graphQLArgs[CONTEXT_INDEX]) {
                graphQLArgs[CONTEXT_INDEX] = {};
            }

            if (!graphQLArgs[CONTEXT_INDEX].injections) {
                graphQLArgs[CONTEXT_INDEX].injections = {};
            }

            if (!(typeof graphQLArgs[CONTEXT_INDEX].injections === "object")) {
                graphQLArgs[CONTEXT_INDEX].injections = {};
            }

            graphQLArgs[CONTEXT_INDEX].injections = {
                ...graphQLArgs[CONTEXT_INDEX].injections,
                execute: execute.withSchema(RUNTIME.schema)
            };

            return graphQLArgs;
        };

        return {
            ...result,
            ...(method.subscribe
                ? {
                      [key]: {
                          ...method,
                          subscribe: (...graphQLArgs) =>
                              method.subscribe(...createArgs(graphQLArgs))
                      }
                  }
                : {
                      [key]: (...graphQLArgs) =>
                          method(...createArgs(graphQLArgs))
                  })
        };
    }, {});
}

module.exports = runtimeInjection;
