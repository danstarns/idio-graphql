/* eslint-disable import/no-extraneous-dependencies */
const { ApolloServer } = require("apollo-server");
const { GraphQLGateway } = require("../../src");

const gateway = new GraphQLGateway(
    { services: { nodes: ["User"] } },
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
        const { typeDefs, resolvers } = await gateway.start();

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
