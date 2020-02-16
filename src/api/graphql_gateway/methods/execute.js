const { graphql } = require("graphql");
const IdioError = require("../../idio-error.js");

/**
 * @typedef {import('graphql').ExecutionResult} ExecutionResult
 * @typedef {import('graphql').GraphQLSchema} GraphQLSchema
 * @typedef {import('./start.js').Runtime} Runtime
 * @typedef {import('moleculer').Context} Context
 */

/**
 * @param {Runtime} RUNTIME
 * @returns {(ctx: Context) => Promise<ExecutionResult>}
 */
function execute(RUNTIME) {
    const { schema } = RUNTIME;

    return async (ctx) => {
        const {
            params: { operationName, document, variables, context, root }
        } = ctx;

        try {
            const { data, errors } = await graphql({
                schema,
                source: document,
                rootValue: root,
                contextValue: context,
                variableValues: variables,
                operationName
            });

            return { data, errors };
        } catch (error) {
            return { errors: [new IdioError(error)] };
        }
    };
}

module.exports = execute;
