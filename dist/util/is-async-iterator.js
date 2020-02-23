"use strict";

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.async-iterator");

function isAsyncIterator(iterator) {
  return iterator && typeof iterator[Symbol.asyncIterator] === "function";
}

module.exports = isAsyncIterator;