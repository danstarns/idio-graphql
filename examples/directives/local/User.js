const { gql } = require("apollo-server");
const { GraphQLNode } = require("../../../../src/api/index.js");
const { users } = require("../../data/index.js");

const users = [
    { id: "0", name: "Bob", age: 3, posts: ["0"] },
    { id: "1", name: "Jane", age: 13, posts: ["1", "2"] },
    { id: "2", name: "Will", age: 23, posts: ["2"] }
];

const User = new GraphQLNode({
    name: "User",
    typeDefs: gql`
        type User {
            name: String @upper
            age: Int
        }

        type Query {
            users: [User]
        }
    `,
    resolvers: {
        Query: {
            users: () => users
        }
    }
});

module.exports = User;
