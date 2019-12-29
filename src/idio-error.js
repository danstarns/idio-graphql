class IdioError extends Error {
    constructor(message) {
        super(message);

        this.name = `idio-graphql-error`;
        this.readme =
            "https://github.com/danstarns/idio-graphql/blob/master/README.md";
        this.chat = "https://spectrum.chat/idio-graphql";
    }
}

module.exports = IdioError;
