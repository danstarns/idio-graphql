function checkInstance({ instance, of, name }) {
    if (!(instance instanceof of)) {
        throw new Error(
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
