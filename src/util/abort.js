const IdioError = require("../api/idio-error.js");

function abort({ params: { message } }) {
    console.error(new IdioError(message));

    process.exit(1);
}

module.exports = abort;
