const sleep = require("util").promisify(setTimeout);

async function* createUser(root, args, contex) {
    while (true) {
        await sleep(2000);

        yield {
            name: "Daniel",
            age: Math.floor(Math.random() * 10)
        };
    }
}

module.exports = {
    subscribe: createUser
};
