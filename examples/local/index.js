/* eslint-disable import/no-extraneous-dependencies */
const { ApolloServer } = require("apollo-server");
const { combineNodes } = require("../../src");
const [User, Post] = require("./nodes/index.js");

async function main() {
    try {
        const { typeDefs, resolvers } = combineNodes([User, Post]);

        const server = new ApolloServer({
            typeDefs,
            resolvers
        });

        await server.listen(4000);

        console.log("http://localhost:4000/graphql");
    } catch (error) {
        console.error(error);
    }
}

main();
