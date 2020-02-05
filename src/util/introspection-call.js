const util = require("util");

const sleep = util.promisify(setTimeout);

module.exports = (RUNTIME, { type }) => {
    const { brokerOptions, broker } = RUNTIME;

    return async function introspectionCall(resolve, reject) {
        try {
            const INTROSPECTION_EVENT = `${brokerOptions.gateway}:introspection.request`;

            await broker.emit(INTROSPECTION_EVENT, {
                type
            });
        } catch (e) {
            e;
        }

        if (!RUNTIME.initialized) {
            await sleep(1000);

            setImmediate(introspectionCall, resolve, reject);
        } else {
            return resolve();
        }
    };
};
