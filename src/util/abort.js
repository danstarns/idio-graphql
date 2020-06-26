/* istanbul ignore next */
function abort({ params: { message } }) {
    console.error(new Error(message));

    process.exit(1);
}

module.exports = abort;
