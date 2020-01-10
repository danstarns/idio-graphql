const util = require("util");

const sleep = util.promisify(setImmediate);

async function* streamToIterator(stream) {
    let buffers = [];
    let error;

    stream.on("data", (buff) => buffers.push(buff));

    stream.on("error", (err) => {
        error = err;
    });

    while (true) {
        await sleep();

        const [result, ...restOfBuffers] = buffers;

        buffers = [...restOfBuffers];

        if (error) {
            throw error;
        }

        if (!result) {
            continue;
        } else {
            yield JSON.parse(result.toString());
        }
    }
}

module.exports = streamToIterator;
