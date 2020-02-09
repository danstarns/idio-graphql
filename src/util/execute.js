const { parse } = require("graphql/language/parser");
const { print } = require("graphql/language/printer");
const { graphql } = require("graphql");
const IdioError = require("../api/idio-error.js");
const ServicesManager = require("./services-manager.js");
const parseTypeDefs = require("./parse-typedefs.js");

/**
 * @typedef {import('graphql').ExecutionResult} ExecutionResult
 * @typedef {import('graphql').DocumentNode} DocumentNode
 * @typedef {import('graphql').OperationDefinitionNode} OperationDefinitionNode
 * @typedef {import('graphql').DirectiveDefinitionNode} DirectiveDefinitionNode
 */

/**
 * @typedef ExecutionContext
 * @property {Object} root
 * @property {Object} context
 * @property {Object} variables
 * @property {string} operationName
 */

/**
 * @typedef {(
 *      document: (DocumentNode|string),
 *      executionContext: ExecutionContext
 *   ) => Promise.<ExecutionResult>
 * } execute
 */

/**
 * @param {Object} RUNTIME
 * @returns {function}
 */
function withBroker(RUNTIME) {
    const { broker, gatewayManagers } = RUNTIME;

    /**
     * @returns {Promise.<ExecutionResult>}
     */
    return async function execute(
        /** @type {(DocumentNode|string)} */ document,
        /** @type {ExecutionContext} */ executionContext
    ) {
        const { root, context, variables, operationName } =
            executionContext || {};

        let selectedGateway;

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

                /** @type {OperationDefinitionNode[]} */
                const operations = definitions.filter(
                    (x) => x.kind === "OperationDefinition"
                );

                if (operations.find((x) => x.operation === "subscription")) {
                    throw new IdioError(
                        "subscriptions not supported with interservice communication."
                    );
                }

                /** @type {DirectiveDefinitionNode[]} */
                const directives = operations
                    .flatMap((operation) => operation.directives || [])
                    .filter((directive) => directive.name.value === "gateway");

                if (directives.length > 1) {
                    throw new IdioError(
                        `Interservice communication @gateway directive only supported once per document.`
                    );
                }

                const [
                    /** @type {DirectiveDefinitionNode} */ directive
                ] = directives;

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

                    const directiveGateway = nameArgument.value.value;

                    if (!gatewayManagers[directiveGateway]) {
                        const foundDirectiveGateways = (
                            await broker.call("$node.list", {
                                onlyAvailable: true
                            })
                        )
                            .filter((_service) => {
                                const [
                                    serviceName,
                                    gatewayName
                                ] = _service.id.split(":");

                                return (
                                    serviceName === directiveGateway &&
                                    gatewayName === directiveGateway
                                );
                            })
                            .map(({ id }) => id);

                        if (foundDirectiveGateways.length) {
                            gatewayManagers[
                                directiveGateway
                            ] = new ServicesManager(
                                `${foundDirectiveGateways[0]}`,
                                {
                                    broker,
                                    hash: directiveGateway
                                }
                            );

                            foundDirectiveGateways
                                .filter((x) => x !== directiveGateway)
                                .forEach((x) => {
                                    gatewayManagers[directiveGateway].push(x);
                                });
                        }
                    }

                    if (!gatewayManagers[directiveGateway]) {
                        return {
                            errors: [
                                new IdioError(
                                    `Cant reach Gateway: '${directiveGateway}'`
                                )
                            ],
                            data: null
                        };
                    }

                    selectedGateway = await gatewayManagers[
                        directiveGateway
                    ].getNextService();

                    if (!selectedGateway) {
                        return {
                            errors: [
                                new IdioError(
                                    `Cant reach Gateway: '${directiveGateway}'`
                                )
                            ],
                            data: null
                        };
                    }

                    document = {
                        ...document,
                        definitions: [...document.definitions].map(
                            (definition) => {
                                if (!definition.directives.length) {
                                    return definition;
                                }

                                return {
                                    ...definition,
                                    directives: definition.directives.filter(
                                        ({ name: { value } }) =>
                                            value !== "gateway"
                                    )
                                };
                            }
                        )
                    };
                }
            } else {
                throw new IdioError(`Invalid document provided.`);
            }

            if (!selectedGateway) {
                selectedGateway = await gatewayManagers[
                    broker.options.gateway
                ].getNextService();

                if (!selectedGateway) {
                    return {
                        errors: [
                            new IdioError(
                                `Cant reach Gateway: '${broker.options.gateway}'`
                            )
                        ],
                        data: null
                    };
                }
            }

            /**
             * @type {ExecutionResult}
             */
            const result = await broker.call(`${selectedGateway}.execute`, {
                document: print(document),
                variables,
                operationName,
                context,
                root
            });

            return result;
        } catch (error) {
            /**
             * @type {ExecutionResult}
             */
            return {
                errors: [
                    new IdioError(
                        `Failed executing inter-service query, Error:\n${error.message}`
                    )
                ],
                data: null
            };
        }
    };
}

function withSchema(schema) {
    return async function execute(document, options) {
        if (!document) {
            throw new IdioError(`document required.`);
        }

        const queryType = typeof document;

        if (queryType !== "object" && queryType !== "string") {
            throw new IdioError(`execute must provide document string or AST.`);
        }

        if (queryType === "string") {
            document = parse(document);
        } else {
            document = print(document);
        }

        const { operationName, variables, context, root } = options;

        try {
            const { data, errors } = await graphql({
                schema,
                source: document,
                rootValue: root,
                contextValue: context,
                variableValues: variables,
                operationName
            });

            /** @type {ExecutionResult} */
            return { data, errors };
        } catch (error) {
            /** @type {ExecutionResult} */
            return { errors: [new IdioError(error)] };
        }
    };
}

module.exports = {
    withBroker,
    withSchema
};
