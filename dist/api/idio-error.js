"use strict";

class IdioError extends Error {
  constructor(message, {
    code = 500
  } = {}) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = `${message}\n${this.stack}`;
    this.error = message;
    this.code = code;
    this.readme = "https://github.com/danstarns/idio-graphql/blob/master/README.md";
    this.chat = "https://spectrum.chat/idio-graphql";
  }

}

module.exports = IdioError;