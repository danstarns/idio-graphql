const { ApolloServer } = require("apollo-server");
const { combineNodes } = require("../../../../src/api/index.js");

const UpperCase = require("./UpperCase.js");
const User = require("./User.js");

async function main() {
    const server = new ApolloServer({
        ...combineNodes([User], { directives: [UpperCase] })
    });

    await server.listen(4009);

    console.log("http://localhost:4009/graphql");
}

main();
