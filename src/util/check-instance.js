const IdioError = require("../api/idio-error.js");

function checkInstance({ instance, of, name }) {
    if (!(instance instanceof of)) {
        throw new IdioError(
            `received a ${name} not a instance of ${of.name} \n${JSON.stringify(
                instance,
                null,
                2
            )}`
        );
    }

    return true;
}

module.exports = checkInstance;
