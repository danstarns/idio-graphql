"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("core-js/modules/es.array.iterator");

var _awaitAsyncGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/awaitAsyncGenerator"));

var _wrapAsyncGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapAsyncGenerator"));

const util = require("util");

const sleep = util.promisify(setImmediate);

function streamToIterator(_x) {
  return _streamToIterator.apply(this, arguments);
}

function _streamToIterator() {
  _streamToIterator = (0, _wrapAsyncGenerator2.default)(function* (stream) {
    let buffers = [];
    let error;
    let active = true;
    stream.on("data", buff => buffers.push(buff));
    stream.on("error", err => {
      error = err;
      active = false;
    });
    stream.on("end", () => {
      active = false;
    });

    while (buffers.length || active) {
      if (error) {
        throw error;
      } // eslint-disable-next-line no-await-in-loop


      yield (0, _awaitAsyncGenerator2.default)(sleep());
      const [result, ...restOfBuffers] = buffers;
      buffers = [...restOfBuffers];
      /* istanbul ignore next */

      if (!result) {
        // eslint-disable-next-line no-continue
        continue;
      } else {
        yield JSON.parse(result.toString());
      }
    }
  });
  return _streamToIterator.apply(this, arguments);
}

module.exports = streamToIterator;