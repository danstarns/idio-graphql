const { ApolloServer } = require("apollo-server");
const { GraphQLGateway } = require("../../src/api/index.js");

const AccountsGateway = GraphQLGateway(
    { services: { nodes: ["User"] } },
    {
        transporter: "NATS",
        nodeID: "accounts_gateway",
        logLevel: "info",
        heartbeatInterval: 3,
        heartbeatTimeout: 5
    }
);

async function main() {
    try {
        const {
            typeDefs,
            resolvers,
            schemaDirectives
        } = await AccountsGateway.start();

        const server = new ApolloServer({
            typeDefs,
            resolvers,
            schemaDirectives
        });

        await server.listen(Number(process.env.PORT));

        console.log(`http://localhost:${process.env.PORT}/graphql`);
    } catch (error) {
        console.error(error);

        process.exit(1);
    }
}

main();
