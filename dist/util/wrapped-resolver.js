"use strict";

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.promise");

/* eslint-disable no-await-in-loop */
const isFunction = require("./is-function.js");

const IdioError = require("../api/idio-error.js");

const INDEX = require("../constants/context-index.js");

const injectGraphQLArgs = require("./inject-graphql-args.js");
/**
 * @typedef {import('graphql').ExecutionResult} ExecutionResult
 * @typedef {import('graphql').ExecutionArgs} ExecutionArgs
 * @typedef {import('graphql').DocumentNode} DocumentNode
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('../util/execute.js').execute} execute
 */

/**
 * @typedef {{execute: execute, dataLoaders?: object, models?: object, broker?: ServiceBroker}} context
 */

/**
 * @typedef {(
 *      root: any,
 *      args: object,
 *      context: context,
 *      info: DocumentNode
 *   ) => any} PreHook
 */

/**
 * @typedef {(PreHook|PreHook[])} PreUnion
 */

/**
 * @typedef {(
 *      resolve: any,
 *      root: any,
 *      args: object,
 *      context: context,
 *      info: DocumentNode
 *   ) => any} PostHook
 */

/**
 * @typedef {(PostHook|PostHook[])} PostUnion
 */

/**
 * @typedef {(
 *      root: any,
 *      args: object,
 *      context: context,
 *      info: DocumentNode
 *   ) => any} resolve
 */

/**
 * @typedef ResolverObjectInput
 * @property {resolve} resolve
 * @property {PreUnion} pre - Function(s) to call pre the resolve method.
 * @property {PostUnion} post - Function(s) to call post the resolve method.
 */

/**
 * @typedef {(ResolverObjectInput|resolve)} ResolverUnion
 */

/**
 * @todo make this use recursion
 * @param {ResolverUnion} input
 * @param {object} options
 * @param {string} options.name
 * @param {string} options.direction
 * @param {array} options.args
 *
 * @returns {Promise<any>}
 */


async function resultFunction(input, {
  direction,
  name,
  args
}) {
  if (Array.isArray(input)) {
    for (let i = 0; i < input.length; i += 1) {
      try {
        await input[i](...args);
      } catch (error) {
        throw new IdioError(`'${name}.${direction}[${i}]' failed: \n ${error}`);
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
 * @param {function} resolver
 * @param {object} options
 * @param {PreUnion} options.pre
 * @param {PostUnion} options.post
 * @param {string} options.name
 * @param {object} options.injections
 *
 * @returns {Promise<any>}
 */


function wrappedResolver(resolver, {
  pre,
  post,
  name,
  injections
} = {}) {
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
      throw new IdioError(`'${name}.pre' must be of type Function|Array<Function>`);
    }

    pre.forEach((func, index) => {
      if (!isFunction(func)) {
        throw new IdioError(`'${name}.pre[${index}]' must be of type 'Function'`);
      }
    });
  }

  if (post && !isFunction(post)) {
    if (!Array.isArray(post)) {
      throw new IdioError(`'${name}.post' must be of type Function|Array<Function>`);
    }

    post.forEach((func, index) => {
      if (!isFunction(func)) {
        throw new IdioError(`'${name}.post[${index}]' must be of type 'Function'`);
      }
    });
  }

  async function newResolver(...graphQLArgs) {
    if (!graphQLArgs[INDEX]) {
      graphQLArgs[INDEX] = {};
    }

    graphQLArgs = injectGraphQLArgs({
      graphQLArgs,
      injections
    });

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