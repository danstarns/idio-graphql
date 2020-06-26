const { parse } = require("graphql/language/parser");
const { print } = require("graphql/language/printer");
const { graphql } = require("graphql");
const ServicesManager = require("./services-manager.js");

/**
 * @typedef {import('graphql').ExecutionResult} ExecutionResult
 * @typedef {import('graphql').DocumentNode} DocumentNode
 * @typedef {import('graphql').GraphQLSchema} GraphQLSchema
 */

/**
 * @typedef ExecutionContext
 * @property {object} root
 * @property {object} context
 * @property {object} variables
 * @property {string} operationName
 */

/**
 * @typedef {(
 *      document: (DocumentNode | string),
 *      executionContext: ExecutionContext
 *   ) => Promise<ExecutionResult>
 * } execute
 */

/**
 *
 * @param {(string | DocumentNode)} document
 * @returns {DocumentNode}
 */
function parseDocument(document) {
    if (!document) {
        throw new Error("document required.");
    }

    const queryType = typeof document;

    if (queryType !== "object" && queryType !== "string") {
        throw new Error(`document must be a string or AST.`);
    }

    if (queryType === "string") {
        document = parse(document);
    }

    const { kind } = document;

    if (kind) {
        const subscriptions = document.definitions.filter(
            (x) =>
                x.kind === "OperationDefinition" &&
                x.operation === "subscription"
        );

        if (subscriptions.length) {
            throw new Error("subscriptions not supported.");
        }
    } else {
        throw new Error(`invalid document provided.`);
    }

    return document;
}

/**
 * @param {object} RUNTIME
 * @returns {execute}
 */
function withBroker(RUNTIME) {
    const { broker, gatewayManagers } = RUNTIME;

    return async function execute(document, executionContext = {}) {
        try {
            document = parseDocument(document);

            const {
                root,
                context,
                variables,
                operationName
            } = executionContext;

            let selectedGateway;

            const directives = document.definitions
                .filter((def) => def.kind === "OperationDefinition")
                .flatMap((operation) => operation.directives)
                .filter((directive) => directive.name.value === "gateway");

            if (directives.length > 1) {
                throw new Error(
                    `interservice communication @gateway directive only supported once per document.`
                );
            }

            const [directive] = directives;

            if (directive) {
                const directiveError = `@gateway directive requires 1 argument, called name, of type string.`;

                if (!directive.arguments.length) {
                    throw new Error(directiveError);
                }

                const nameArgument = directive.arguments.find(
                    (x) => x.name.value === "name"
                );

                if (!nameArgument) {
                    throw new Error(directiveError);
                }

                if (nameArgument.value.kind !== "StringValue") {
                    throw new Error(directiveError);
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
                        gatewayManagers[directiveGateway] = new ServicesManager(
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
                    throw new Error(
                        `cannot reach gateway: '${directiveGateway}'`
                    );
                }

                selectedGateway = await gatewayManagers[
                    directiveGateway
                ].getNextService();

                if (!selectedGateway) {
                    throw new Error(
                        `cannot reach gateway: '${directiveGateway}'`
                    );
                }

                document = {
                    ...document,
                    definitions: [...document.definitions].map((definition) => {
                        if (!definition.directives.length) {
                            return definition;
                        }

                        return {
                            ...definition,
                            directives: definition.directives.filter(
                                ({ name: { value } }) => value !== "gateway"
                            )
                        };
                    })
                };
            } else {
                selectedGateway = await gatewayManagers[
                    broker.options.gateway
                ].getNextService();

                if (!selectedGateway) {
                    throw new Error(
                        `cannot reach gateway: '${broker.options.gateway}'`
                    );
                }
            }

            const { data, errors } = await broker.call(
                `${selectedGateway}.execute`,
                {
                    document: print(document),
                    context,
                    root,
                    variables,
                    operationName
                }
            );

            return { data, errors };
        } catch ({ message, stack }) {
            return {
                errors: [{ message, path: stack }],
                data: null
            };
        }
    };
}

/**
 *
 * @param {GraphQLSchema} schema
 * @returns {execute}
 */
function withSchema(schema) {
    return async function execute(document, executionContext = {}) {
        try {
            document = parseDocument(document);

            const {
                operationName,
                variables,
                context,
                root
            } = executionContext;

            const { data, errors } = await graphql({
                schema,
                source: print(document),
                rootValue: root,
                contextValue: context,
                variableValues: variables,
                operationName
            });

            return { data, errors };
        } catch ({ message }) {
            return { errors: [new Error(message)], data: null };
        }
    };
}

module.exports = {
    withBroker,
    withSchema
};
