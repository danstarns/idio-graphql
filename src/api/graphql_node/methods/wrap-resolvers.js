/* eslint-disable no-restricted-syntax */
const CONTEXT_INDEX = require("../../../constants/context-index.js");
const { wrappedResolver, isFunction } = require("../../../util/index.js");
const IdioError = require("../../idio-error.js");

function wrapResolvers(node) {
    const prefix = `GraphQLNode with name: '${node.name}'`;

    return ["Query", "Mutation", "Subscription", "Fields"].reduce(
        (resolvers, type) => {
            const methods = node.resolvers[type];

            if (methods) {
                Object.keys(methods).forEach((name) => {
                    const method = methods[name];

                    if (!resolvers[type]) {
                        resolvers[type] = {};
                    }

                    if (isFunction(method)) {
                        resolvers = {
                            ...resolvers,
                            [type]: {
                                ...resolvers[type],
                                [name]: wrappedResolver(method, {
                                    name: `${node.name}.resolvers.${type}.${name}`,
                                    injections: node.injections
                                })
                            }
                        };

                        return;
                    }

                    if (Object.keys(method).includes("subscribe")) {
                        resolvers[type][name] = {
                            ...method,
                            async *subscribe(...graphQLArgs) {
                                try {
                                    if (!graphQLArgs[CONTEXT_INDEX]) {
                                        graphQLArgs[CONTEXT_INDEX] = {};
                                    }

                                    graphQLArgs[CONTEXT_INDEX].injections = {
                                        ...(graphQLArgs[CONTEXT_INDEX]
                                            .injections || {}),
                                        ...(node.injections || {})
                                    };

                                    const iterator = await method.subscribe(
                                        ...graphQLArgs
                                    );

                                    for await (const chunk of iterator) {
                                        yield chunk;
                                    }
                                } catch (error) {
                                    throw new IdioError(
                                        `${prefix} resolvers.${type}.${name} failed:\n${error}`
                                    );
                                }
                            }
                        };

                        return;
                    }

                    if (Object.keys(method).includes("resolve")) {
                        const { pre, resolve, post } = method;

                        resolvers[type][name] = wrappedResolver(resolve, {
                            pre,
                            post,
                            name: `${node.name}.resolvers.${type}.${name}`,
                            injections: node.injections
                        });

                        return;
                    }

                    throw new IdioError(
                        `${prefix} has resolver.${type}.${name} that requires a 'resolve' method.`
                    );
                });
            }

            return resolvers;
        },
        {}
    );
}

module.exports = wrapResolvers;
