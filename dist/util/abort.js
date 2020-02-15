"use strict";

const IdioError = require("../api/idio-error.js");
/* istanbul ignore next */


function abort({
  params: {
    message
  }
}) {
  console.error(new IdioError(message));
  process.exit(1);
}

module.exports = abort;