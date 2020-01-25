const { parse } = require("graphql/language/parser");
const { print } = require("graphql/language/printer");
const IdioError = require("../../idio-error.js");
/**
 * @typedef ExecutionContext
 * @property {Object} root
 * @property {Object} context
 * @property {Object} variables
 * @property {string} operationName
 */

/**
 * @typedef ExecuteOptions
 * @property {string} gateway
 */

/**
 *
 * @param {ServiceBroker} broker
 * @param {ExecuteOptions} options
 *
 * @returns {Function}
 */
function execute(broker, { gateway }) {
    /**
     *
     * @param {(DocumentNode|string)} document
     * @param {ExecutionContext} executionContext
     *
     * @returns {Promise.<ExecutionResult>}
     */

    return function _execute(document, executionContext = {}) {
        const { root, context, variables, operationName } = executionContext;

        try {
            if (!document) {
                throw new IdioError(`document required.`);
            }

            const queryType = typeof document;

            if (queryType !== "object" && queryType !== "string") {
                throw new IdioError(
                    `execute must provide document string or AST.`
                );
            }

            if (queryType === "string") {
                document = parse(document);
            }

            const { kind } = document;

            if (kind) {
                const { definitions = [] } = document;

                const operations = definitions.filter(
                    (x) => x.kind === "OperationDefinition"
                );

                if (operations.find((x) => x.operation === "subscription")) {
                    throw new IdioError(
                        "subscriptions not supported with interservice communication."
                    );
                }

                const directives = operations
                    .flatMap((operation) => operation.directives || [])
                    .filter((directive) => directive.name.value === "gateway");

                if (directives.length > 0) {
                    throw new IdioError(
                        `Interservice communication @gateway directive only supported once per document.`
                    );
                }

                const [directive] = directives;

                if (directive) {
                    const directiveError = `@gateway directive requires 1 argument, called name, of type string.`;

                    if (!directive.arguments.length) {
                        throw new IdioError(directiveError);
                    }

                    const nameArgument = directive.arguments.find(
                        (x) => x.name.value === "name"
                    );

                    if (!nameArgument) {
                        throw new IdioError(directiveError);
                    }

                    if (!nameArgument.value.kind === "StringValue") {
                        throw new IdioError(directiveError);
                    }

                    gateway = nameArgument.value.value;
                }
            } else {
                throw new IdioError(`Invalid document provided.`);
            }

            return broker.call(`${gateway}.execute`, {
                document: print(document),
                variables,
                operationName,
                context,
                root
            });
        } catch (error) {
            throw new IdioError(
                `Failed executing inter-service query, Error:\n${error}`
            );
        }
    };
}

module.exports = execute;
