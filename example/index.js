const { ApolloServer } = require("apollo-server");
const { combineNodes } = require("../src/index.js");

const nodes = require("./nodes/index.js");

(async function Main() {
    try {
        const { typeDefs, resolvers } = await combineNodes(nodes);

        const server = new ApolloServer({ typeDefs, resolvers });

        await server.listen(4000);

        console.log("Listing on localhost:4000/graphql");
    } catch (error) {
        console.error(error);
    }
})();
