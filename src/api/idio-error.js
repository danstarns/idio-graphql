class IdioError extends Error {
    constructor(message, { code = 500 } = {}) {
        super(message);
        Error.captureStackTrace(this, this.constructor);

        this.name = this.constructor.name;

        this.message = `${message}`;
        this.error = message;
        this.code = code;
    }
}

module.exports = IdioError;
