const { gql } = require("apollo-server");
const { GraphQLNode } = require("../../../src/api/index.js");

const products = [
    { id: "0", title: "Beer", price: 0 },
    { id: "1", title: "Milk", price: 1 },
    { id: "2", title: "Water", price: 2 }
];

const Product = new GraphQLNode({
    name: "Product",
    typeDefs: gql`
        type User {
            name: String
            age: String
        }

        type Product {
            title: String
            price: Int
            users: [User]
        }

        type Query {
            product(id: ID!): Product
            products: [Product]
        }
    `,
    resolvers: {
        Fields: {
            users: async (_, args, { broker }) => {
                const res = await broker.gql.execute(gql`
                    query @gateway(name: "accounts_gateway") {
                        users {
                            name
                            age
                        }
                    }
                `);

                const { data: { users } = {}, errors } = res;

                if (errors) {
                    throw new Error(errors[0].message);
                }

                return users;
            }
        },
        Query: {
            products: async () => products,
            product: (root, { id }) => products.find((x) => x.id === id)
        }
    }
});

async function main() {
    try {
        await Product.serve({
            gateway: "inventory_gateway",
            transporter: "NATS",
            logLevel: "info",
            heartbeatInterval: 3,
            heartbeatTimeout: 5
        });

        console.log("Product Online");
    } catch (error) {
        console.error(error);

        process.exit(1);
    }
}

main();
