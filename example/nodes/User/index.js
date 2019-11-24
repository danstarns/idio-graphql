const { GraphQLNode } = require("../../../src/index.js");

const Query = require("./Query/index.js");
const Mutation = require("./Mutation/index.js");
const Subscription = require("./Subscription/index.js");
const Fields = require("./Fields/index.js");

const User = new GraphQLNode({
    name: "User",
    typeDefs: "./User.gql",
    resolvers: { Query, Mutation, Subscription, Fields }
});

module.exports = User;
