const { ApolloServer } = require("apollo-server");
const { GraphQLGateway } = require("../../src/api/index.js");

const InventoryGateway = GraphQLGateway(
    {
        services: {
            nodes: ["Product"]
        }
    },
    {
        transporter: "NATS",
        nodeID: "inventory_gateway",
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
        } = await InventoryGateway.start();

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
