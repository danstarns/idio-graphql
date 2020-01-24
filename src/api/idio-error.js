class IdioError extends Error {
    constructor(message, { code = 500 } = {}) {
        super(message);
        this.name = this.constructor.name;

        this.message = message;
        this.error = message;
        this.code = code;
        this.readme =
            "https://github.com/danstarns/idio-graphql/blob/master/README.md";
        this.chat = "https://spectrum.chat/idio-graphql";

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = IdioError;
