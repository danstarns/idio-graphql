/* eslint-disable no-await-in-loop */
const isFunction = require("./is-function.js");
const IdioError = require("../api/idio-error.js");
const CONTEXT_INDEX = require("../constants/context-index.js");

/**
 * @param {(Function|Array.<Function>)} input
 * @param {Object} options
 * @param {String} options.name
 * @param {String} options.direction
 * @param {Array} options.args
 *
 * @returns {Promise}
 */
async function resultFunction(input, { direction, name, args }) {
    if (Array.isArray(input)) {
        for (let i = 0; i < input.length; i += 1) {
            try {
                await input[i](...args);
            } catch (error) {
                throw new IdioError(
                    `'${name}.${direction}[${i}]' failed: \n ${error}`
                );
            }
        }
    }

    if (isFunction(input)) {
        try {
            await input(...args);
        } catch (error) {
            throw new IdioError(`'${name}.${direction}' failed: \n ${error}`);
        }
    }
}

/**
 * @typedef {Function} PreHook
 * @param {any}    root
 * @param {Object} args
 * @param {Object} context
 * @param {Object} info
 */

/**
 * @typedef {(PreHook|Array.<PreHook>)} PreUnion
 */

/**
 * @typedef {Function} PostHook
 * @param {any}    resolve - The outcome of the resolve method.
 * @param {any}    root
 * @param {Object} args
 * @param {Object} context
 * @param {Object} info
 */

/**
 * @typedef {(PostHook|Array.<PostHook>)} PostUnion
 */

/**
 * 1. Executes the pre functions(...args)
 * 2. Executes 'resolve' function
 * 3. Executes the post functions('resolve', ...args)
 *
 * @param {Function} resolver
 * @param {Object} options
 * @param {PreUnion} options.pre
 * @param {PostUnion} options.post
 * @param {String} options.name
 * @param {any} options.injections
 *
 * @returns {Promise}
 */
function wrappedResolver(resolver, { pre, post, name, injections } = {}) {
    if (!resolver) {
        throw new IdioError("resolver required.");
    }

    if (!isFunction(resolver)) {
        throw new IdioError("resolver must be of type 'Function'.");
    }

    if (!name) {
        throw new IdioError("name required.");
    }

    if (typeof name !== "string") {
        throw new IdioError("name must be of type 'String'.");
    }

    if (pre && !isFunction(pre)) {
        if (!Array.isArray(pre)) {
            throw new IdioError(
                `'${name}.pre' must be of type Function|Array<Function>`
            );
        }

        pre.forEach((func, index) => {
            if (!isFunction(func)) {
                throw new IdioError(
                    `'${name}.pre[${index}]' must be of type 'Function'`
                );
            }
        });
    }

    if (post && !isFunction(post)) {
        if (!Array.isArray(post)) {
            throw new IdioError(
                `'${name}.post' must be of type Function|Array<Function>`
            );
        }

        post.forEach((func, index) => {
            if (!isFunction(func)) {
                throw new IdioError(
                    `'${name}.post[${index}]' must be of type 'Function'`
                );
            }
        });
    }

    async function newResolver(...args) {
        if (injections) {
            if (!(typeof args[CONTEXT_INDEX] === "object")) {
                args[CONTEXT_INDEX] = Object(args[CONTEXT_INDEX] || {});
            }

            args[CONTEXT_INDEX].injections = {
                ...(args[CONTEXT_INDEX].injections || {}),
                ...injections
            };
        }

        if (pre) {
            await resultFunction(pre, {
                direction: "pre",
                name,
                args
            });
        }

        const resolve = await resolver(...args);

        args = [resolve, ...args];

        if (post) {
            await resultFunction(post, {
                direction: "post",
                name,
                args
            });
        }

        return resolve;
    }

    return newResolver;
}

module.exports = wrappedResolver;
