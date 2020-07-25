/* eslint-disable no-await-in-loop */
const isFunction = require("./is-function.js");
const INDEX = require("../constants/context-index.js");
const injectGraphQLArgs = require("./inject-graphql-args.js");

async function resultFunction(input, { args }) {
    if (Array.isArray(input)) {
        let counter = 0;

        await (async function recursion() {
            if (counter < input.length) {
                await input[counter](...args);

                counter += 1;

                return recursion();
            }
            return Promise.resolve();
        })();
    }

    if (isFunction(input)) {
        await input(...args);
    }
}

function wrappedResolver(resolver, { pre, post, name, injections } = {}) {
    if (!resolver) {
        throw new Error("resolver required.");
    }

    if (!isFunction(resolver)) {
        throw new Error("resolver must be of type 'Function'.");
    }

    if (!name) {
        throw new Error("name required.");
    }

    if (typeof name !== "string") {
        throw new Error("name must be of type 'String'.");
    }

    if (pre && !isFunction(pre)) {
        if (!Array.isArray(pre)) {
            throw new Error(
                `'${name}.pre' must be of type Function|Array<Function>`
            );
        }

        pre.forEach((func, index) => {
            if (!isFunction(func)) {
                throw new Error(
                    `'${name}.pre[${index}]' must be of type 'Function'`
                );
            }
        });
    }

    if (post && !isFunction(post)) {
        if (!Array.isArray(post)) {
            throw new Error(
                `'${name}.post' must be of type Function|Array<Function>`
            );
        }

        post.forEach((func, index) => {
            if (!isFunction(func)) {
                throw new Error(
                    `'${name}.post[${index}]' must be of type 'Function'`
                );
            }
        });
    }

    async function newResolver(...graphQLArgs) {
        if (!graphQLArgs[INDEX]) {
            graphQLArgs[INDEX] = {};
        }

        graphQLArgs = injectGraphQLArgs({ graphQLArgs, injections });

        if (pre) {
            await resultFunction(pre, {
                direction: "pre",
                name,
                args: graphQLArgs
            });
        }

        const resolve = await resolver(...graphQLArgs);

        graphQLArgs = [resolve, ...graphQLArgs];

        if (post) {
            await resultFunction(post, {
                direction: "post",
                name,
                args: graphQLArgs
            });
        }

        return resolve;
    }

    return newResolver;
}

module.exports = wrappedResolver;
