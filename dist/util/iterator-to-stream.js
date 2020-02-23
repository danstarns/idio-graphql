"use strict";

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.promise");

const {
  Readable
} = require("stream");

const isAsyncIterator = require("./is-async-iterator.js");

function IteratorToStream(iterator) {
  if (!isAsyncIterator(iterator)) {
    throw new TypeError("iterator must be a 'async iterator'");
  }

  Readable.call(this, {
    objectMode: true
  });
  this.iterator = iterator;
}

async function _read() {
  try {
    const {
      done,
      value
    } = await this.iterator.next();
    this.push(done ? null : JSON.stringify(value));
  } catch (error) {
    /* istanbul ignore next */
    this.emit("error", error);
  }
}

IteratorToStream.prototype = Object.create(Readable.prototype, {
  constructor: {
    value: IteratorToStream
  }
});
IteratorToStream.prototype._read = _read;

module.exports = (...args) => new IteratorToStream(...args);