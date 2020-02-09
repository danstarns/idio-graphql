const { ApolloServer } = require("apollo-server");
const { GraphQLGateway } = require("../../../src/api/index.js");

const AccountsGateway = GraphQLGateway(
    { services: { nodes: ["User", "Post"] } },
    {
        transporter: "NATS",
        nodeID: "gateway",
        logLevel: "info",
        heartbeatInterval: 3,
        heartbeatTimeout: 5
    }
);

async function main() {
    try {
        const { typeDefs, resolvers } = await AccountsGateway.start();

        const server = new ApolloServer({
            typeDefs,
            resolvers
        });

        await server.listen(4000);

        console.log(`http://localhost:4000/graphql`);
    } catch (error) {
        console.error(error);

        process.exit(1);
    }
}

main();
