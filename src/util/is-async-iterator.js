function isAsyncIterator(iterator) {
    return iterator && typeof iterator[Symbol.asyncIterator] === "function";
}

module.exports = isAsyncIterator;
