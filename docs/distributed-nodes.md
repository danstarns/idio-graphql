---
id: distributed-nodes
title: Distributed Nodes
---

```javascript
async function main() {
    try {
        const gateway = GraphQLGateway(
            {
                services: { nodes: ["User", "Post"] },
                locals: { directives: [upperCase], scalars: [JSONScalar] }
            },
            {
                transporter: "NATS",
                nodeID: "gateways"
            }
        );

        const { typeDefs, resolvers, schemaDirectives } = await gateway.start();

        const server = new ApolloServer({
            typeDefs,
            resolvers,
            schemaDirectives: { ...schemaDirectives },
            context: () => ({
                pee: "poo"
            })
        });

        await server.listen(4000);

        console.error("Server online: http://localhost:4000/graphql");
    } catch (error) {
        console.error(error);
    }
}

main();
```