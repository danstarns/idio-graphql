const { ApolloServer } = require("apollo-server");
const { combineNodes } = require("../../../src/api/index.js");
const [User, Post] = require("./nodes/index.js");

async function main() {
    try {
        const { typeDefs, resolvers } = combineNodes([User, Post]);

        const server = new ApolloServer({
            typeDefs,
            resolvers
        });

        await server.listen(4000);

        console.log("http://localhpst:4000/graphql");
    } catch (error) {
        console.error(error);
    }
}

main();
