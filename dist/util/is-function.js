"use strict";

function isFunction(value) {
  return value && (Object.prototype.toString.call(value) === "[object Function]" || typeof value === "function" || value instanceof Function);
}

module.exports = isFunction;