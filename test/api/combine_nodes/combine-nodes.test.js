const { expect } = require("chai");
const path = require("path");
const { GraphQLScalarType } = require("graphql");
const { GraphQLJSON } = require("graphql-type-json");
const { AuthDirective } = require("graphql-directive-auth");
const gql = require("graphql-tag");
const { GraphQLSchema } = require("graphql");
const {
    combineNodes,
    GraphQLNode,
    IdioEnum,
    IdioScalar,
    IdioDirective
} = require("../../../src");

describe("combineNodes", () => {
    it("should throw nodes required", () => {
        try {
            combineNodes();

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain("nodes required");
        }
    });

    it("should throw node should be of type array", () => {
        try {
            combineNodes(99);

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "expected nodes to be of type array received 'number'"
            );
        }
    });

    it("should throw node should be a instance of GraphQLNode", () => {
        try {
            combineNodes([
                {
                    name: "User",
                    typeDefs: gql`
                        type User {
                            name: String
                            age: Int
                        }

                        type Query {
                            getUserByID(id: ID!): User
                        }
                    `,
                    resolvers: {
                        Query: {},
                        Mutation: {},
                        Subscription: {},
                        Fields: {}
                    }
                }
            ]);

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "received a node not a instance of GraphQLNode"
            );
        }
    });

    it("should combine 1 node and return typeDefs and resolvers", () => {
        const UserNode = new GraphQLNode({
            name: "User",
            typeDefs: gql`
                type User {
                    name: String
                    age: Int
                }

                type Mutation {
                    updateUser(id: ID!): User
                }
            `,
            resolvers: {
                Mutation: { updateUser: () => true }
            }
        });

        const { typeDefs, resolvers, schema } = combineNodes([UserNode]);

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type User");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type Mutation");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("schema");

        expect(schema).to.be.a.instanceOf(GraphQLSchema);

        expect(resolvers)
            .to.be.an("object")
            .to.have.property("Mutation")
            .to.have.property("updateUser")
            .to.be.a("function");
    });

    it("should combine 1 node (with a enum) and return typeDefs and resolvers", () => {
        const StatusEnum = new IdioEnum({
            name: "Status",
            typeDefs: gql`
                enum Status {
                    ONLINE
                    OFFLINE
                }
            `,
            resolver: {
                ONLINE: "online",
                OFFLINE: "offline"
            }
        });

        const UserNode = new GraphQLNode({
            name: "User",
            typeDefs: gql`
                type User {
                    name: String
                    age: Int
                }

                type Query {
                    getUserByID(id: ID!): User
                }
            `,
            resolvers: {
                Query: { getUserByID: () => true },
                Mutation: {},
                Subscription: {},
                Fields: {}
            },
            enums: [StatusEnum]
        });

        const { typeDefs, resolvers, schema } = combineNodes([UserNode]);

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type User");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type Query");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("schema");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("enum Status");

        expect(schema).to.be.a.instanceOf(GraphQLSchema);

        expect(resolvers)
            .to.be.an("object")
            .to.have.property("Query")
            .to.have.property("getUserByID")
            .to.be.a("function");

        expect(resolvers)
            .to.be.an("object")
            .to.have.property("Status")
            .to.be.a("Object");
    });

    it("should throw node has Query in the typeDefs thats not defined in resolvers", () => {
        try {
            const UserNode = new GraphQLNode({
                name: "User",
                typeDefs: gql`
                    type User {
                        name: String
                        age: Int
                    }

                    type Query {
                        getUserByID(id: ID!): User
                        users: [User]
                    }
                `,
                resolvers: {
                    Query: { getUserByID: () => true },
                    Mutation: {},
                    Subscription: {},
                    Fields: {}
                }
            });

            combineNodes([UserNode]);

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "GraphQLNode with name: 'User' has a Query in the typeDefs called 'users' thats not defined in resolvers"
            );
        }
    });

    it("should throw node has a Query resolver thats not defined in typeDefs", () => {
        try {
            const UserNode = new GraphQLNode({
                name: "User",
                typeDefs: gql`
                    type User {
                        name: String
                        age: Int
                    }

                    type Query {
                        getUserByID(id: ID!): User
                    }
                `,
                resolvers: {
                    Query: { getUserByID: () => true, users: () => true },
                    Mutation: {},
                    Subscription: {},
                    Fields: {}
                }
            });

            combineNodes([UserNode]);

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "GraphQLNode with name: 'User' has a Query resolver called 'users' thats not defined in typeDefs"
            );
        }
    });

    it("should throw node has Mutation in the typeDefs thats not defined in resolvers", () => {
        try {
            const UserNode = new GraphQLNode({
                name: "User",
                typeDefs: gql`
                    type User {
                        name: String
                        age: Int
                    }

                    type Mutation {
                        createUser(name: String): User
                        updateUser(id: ID!): User
                    }
                `,
                resolvers: {
                    Query: {},
                    Mutation: {
                        createUser: () => true
                    },
                    Subscription: {},
                    Fields: {}
                }
            });

            combineNodes([UserNode]);

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "GraphQLNode with name: 'User' has a Mutation in the typeDefs called 'updateUser' thats not defined in resolvers"
            );
        }
    });

    it("should throw node has a Mutation resolver thats not defined in typeDefs", () => {
        try {
            const UserNode = new GraphQLNode({
                name: "User",
                typeDefs: gql`
                    type User {
                        name: String
                        age: Int
                    }

                    type Mutation {
                        updateUser(id: ID!): User
                    }
                `,
                resolvers: {
                    Query: {},
                    Mutation: {
                        createUser: () => true,
                        updateUser: () => true
                    },
                    Subscription: {},
                    Fields: {}
                }
            });

            combineNodes([UserNode]);

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "GraphQLNode with name: 'User' has a Mutation resolver called 'createUser' thats not defined in typeDefs"
            );
        }
    });

    it("should throw node has Subscription in the typeDefs thats not defined in resolvers", () => {
        try {
            const UserNode = new GraphQLNode({
                name: "User",
                typeDefs: gql`
                    type User {
                        name: String
                        age: Int
                    }

                    type Query {
                        getUser: User
                    }

                    type Subscription {
                        userCreation: User
                    }
                `,
                resolvers: {
                    Query: { getUser: () => true },
                    Mutation: {},
                    Subscription: {},
                    Fields: {}
                }
            });

            combineNodes([UserNode]);

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "GraphQLNode with name: 'User' has a Subscription in the typeDefs called 'userCreation' thats not defined in resolvers"
            );
        }
    });

    it("should throw node has a Subscription resolver thats not defined in typeDefs", () => {
        try {
            const UserNode = new GraphQLNode({
                name: "User",
                typeDefs: gql`
                    type User {
                        name: String
                        age: Int
                    }

                    type Subscription {
                        userCreation: User
                    }
                `,
                resolvers: {
                    Query: {},
                    Mutation: {},
                    Subscription: {
                        userCreation: {
                            subscribe: () => true
                        },
                        userUpdate: {
                            subscribe: () => true
                        }
                    },
                    Fields: {}
                }
            });

            combineNodes([UserNode]);

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "GraphQLNode with name: 'User' has a Subscription resolver called 'userUpdate' thats not defined in typeDefs"
            );
        }
    });

    it("should combine 1 node (with a nested node) and return typeDefs and resolvers", () => {
        const NestedNode = new GraphQLNode({
            name: "Nested",
            typeDefs: gql`
                type Nested {
                    title: String
                }

                type Query {
                    getNested: Nested
                }
            `,
            resolvers: {
                Query: {
                    getNested: () => true
                }
            }
        });

        const UserNode = new GraphQLNode({
            name: "User",
            typeDefs: gql`
                type User {
                    name: String
                    age: Int
                }

                type Query {
                    getUserByID(id: ID!): User
                }
            `,
            resolvers: {
                Query: { getUserByID: () => true },
                Mutation: {},
                Subscription: {},
                Fields: {}
            },
            nodes: [NestedNode]
        });

        const { typeDefs, resolvers, schema } = combineNodes([UserNode]);

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type User");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type Nested");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type Query");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("schema");

        expect(schema).to.be.a.instanceOf(GraphQLSchema);

        expect(resolvers)
            .to.be.an("object")
            .to.have.property("Query")
            .to.be.a("object")
            .to.have.property("getUserByID")
            .to.be.a("function");

        expect(resolvers)
            .to.be.an("object")
            .to.have.property("Query")
            .to.have.property("getNested")
            .to.be.a("function");
    });

    it("should throw expected enums to be an array", () => {
        try {
            const UserNode = new GraphQLNode({
                name: "User",
                typeDefs: gql`
                    type User {
                        name: String
                        age: Int
                    }

                    type Query {
                        getUserByID(id: ID!): User
                    }
                `,
                resolvers: {
                    Query: { getUserByID: () => true }
                }
            });

            combineNodes([UserNode], { enums: {} });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain("expected 'enums' to be an array");
        }
    });

    it("should throw received enum not a instance of IdioEnum", () => {
        try {
            const UserNode = new GraphQLNode({
                name: "User",
                typeDefs: gql`
                    type User {
                        name: String
                        age: Int
                    }

                    type Query {
                        getUserByID(id: ID!): User
                    }
                `,
                resolvers: {
                    Query: { getUserByID: () => true }
                }
            });

            combineNodes([UserNode], {
                enums: [
                    {
                        name: "Status",
                        resolver: {
                            ONLINE: "online",
                            OFFLINE: "offline"
                        },
                        typeDefs: gql`
                            enum Status {
                                ONLINE
                                OFFLINE
                            }
                        `
                    }
                ]
            });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                `received a enum not a instance of IdioEnum`
            );
        }
    });

    it("should combine 1 node & a global enum and return typeDefs and resolvers", () => {
        const StatusEnum = new IdioEnum({
            name: "Status",
            resolver: {
                ONLINE: "online",
                OFFLINE: "offline"
            },
            typeDefs: gql`
                enum Status {
                    ONLINE
                    OFFLINE
                }
            `
        });

        const UserNode = new GraphQLNode({
            name: "User",
            typeDefs: gql`
                type User {
                    name: String
                    age: Int
                    status: Status
                }

                type Query {
                    getUserByID(id: ID!): User
                }
            `,
            resolvers: {
                Query: { getUserByID: () => true }
            }
        });

        const { typeDefs, resolvers, schema } = combineNodes([UserNode], {
            enums: [StatusEnum]
        });

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type User");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("enum Status");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("schema");

        expect(schema).to.be.a.instanceOf(GraphQLSchema);

        expect(resolvers)
            .to.be.an("object")
            .to.have.property("Query")
            .to.have.property("getUserByID")
            .to.be.a("function");

        expect(resolvers)
            .to.be.an("object")
            .to.have.property("Status")
            .to.be.a("object");
    });

    it("should throw expected scalars to be an array", () => {
        try {
            const UserNode = new GraphQLNode({
                name: "User",
                typeDefs: gql`
                    type User {
                        name: String
                        age: Int
                    }

                    type Query {
                        getUserByID(id: ID!): User
                    }
                `,
                resolvers: {
                    Query: { getUserByID: () => true }
                }
            });

            combineNodes([UserNode], { scalars: {} });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "expected 'scalars' to be an array"
            );
        }
    });

    it("should throw received scalar to be of type IdioScalar", () => {
        try {
            const UserNode = new GraphQLNode({
                name: "User",
                typeDefs: gql`
                    type User {
                        name: String
                        age: Int
                    }

                    type Query {
                        getUserByID(id: ID!): User
                    }
                `,
                resolvers: {
                    Query: { getUserByID: () => true }
                }
            });

            combineNodes([UserNode], {
                scalars: [{ name: "JSON", resolver: () => true }]
            });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                `received a scalar not a instance of IdioScalar`
            );
        }
    });

    it("should combine 1 node & a global scalar and return typeDefs and resolvers", () => {
        const JSONScalar = new IdioScalar({
            name: "JSON",
            resolver: GraphQLJSON
        });

        const UserNode = new GraphQLNode({
            name: "User",
            typeDefs: gql`
                type User {
                    name: String
                    age: Int
                }

                type Query {
                    getUserByID(id: ID!): User
                }
            `,
            resolvers: {
                Query: { getUserByID: () => true }
            }
        });

        const { typeDefs, resolvers, schema } = combineNodes([UserNode], {
            scalars: [JSONScalar]
        });

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type User");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("scalar JSON");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("schema");

        expect(schema).to.be.a.instanceOf(GraphQLSchema);

        expect(resolvers)
            .to.be.an("object")
            .to.have.property("Query")
            .to.have.property("getUserByID")
            .to.be.a("function");

        expect(resolvers)
            .to.be.an("object")
            .to.have.property("JSON")
            .to.be.instanceOf(GraphQLScalarType);
    });

    it("should throw expected directives to be an array", () => {
        try {
            const UserNode = new GraphQLNode({
                name: "User",
                typeDefs: gql`
                    type User {
                        name: String
                        age: Int
                    }

                    type Query {
                        getUserByID(id: ID!): User
                    }
                `,
                resolvers: {
                    Query: { getUserByID: () => true }
                }
            });

            combineNodes([UserNode], { directives: {} });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "expected 'directives' to be an array"
            );
        }
    });

    it("should throw received a directive not a instance of IdioDirective", () => {
        try {
            const UserNode = new GraphQLNode({
                name: "User",
                typeDefs: gql`
                    type User {
                        name: String
                        age: Int
                    }

                    type Query {
                        getUserByID(id: ID!): User
                    }
                `,
                resolvers: {
                    Query: { getUserByID: () => true }
                }
            });

            combineNodes([UserNode], {
                directives: [
                    {
                        name: "hasPermission",
                        resolver: () => true,
                        typeDefs: gql`
                            input permissionInput {
                                resource: String!
                                action: String!
                            }

                            directive @hasPermission(
                                permission: permissionInput!
                            ) on FIELD_DEFINITION
                        `
                    }
                ]
            });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                `received a directive not a instance of IdioDirective`
            );
        }
    });

    it("should combine 1 node & a global directive and return typeDefs and resolvers & schemaDirectives", () => {
        const { isAuthenticated } = AuthDirective();

        const hasPermissionDirective = new IdioDirective({
            name: "hasPermission",
            resolver: isAuthenticated,
            typeDefs: gql`
                input permissionInput {
                    resource: String!
                    action: String!
                }

                directive @hasPermission(
                    permission: permissionInput!
                ) on FIELD_DEFINITION
            `
        });

        const UserNode = new GraphQLNode({
            name: "User",
            typeDefs: gql`
                type User {
                    name: String
                    age: Int
                }

                type Query {
                    getUserByID(id: ID!): User
                }
            `,
            resolvers: {
                Query: { getUserByID: () => true }
            }
        });

        const { typeDefs, resolvers, schemaDirectives, schema } = combineNodes(
            [UserNode],
            {
                directives: [hasPermissionDirective]
            }
        );

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type User");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("directive @hasPermission");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("schema");

        expect(schema).to.be.a.instanceOf(GraphQLSchema);

        expect(resolvers)
            .to.be.an("object")
            .to.have.property("Query")
            .to.have.property("getUserByID")
            .to.be.a("function");

        expect(schemaDirectives)
            .to.be.an("object")
            .to.have.property("hasPermission")
            .to.be.a("function");
    });

    it("should apply an array of schemaGlobals and return resolvers and typeDefs", () => {
        const UserNode = new GraphQLNode({
            name: "User",
            typeDefs: gql`
                type User {
                    name: String
                    age: Int
                    address: Address
                }

                type Query {
                    getUserByID(id: ID!): User
                }
            `,
            resolvers: {
                Query: { getUserByID: () => true }
            }
        });

        const { typeDefs, resolvers, schema } = combineNodes([UserNode], {
            schemaGlobals: [
                gql`
                    type Address {
                        line1: String
                        line2: String
                        postcode: String
                    }
                `
            ]
        });

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type User");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type Address");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("schema");

        expect(schema).to.be.a.instanceOf(GraphQLSchema);

        expect(resolvers)
            .to.be.an("object")
            .to.have.property("Query")
            .to.have.property("getUserByID")
            .to.be.a("function");
    });

    it("should apply a single schemaGlobal and return resolvers and typeDefs", () => {
        const UserNode = new GraphQLNode({
            name: "User",
            typeDefs: gql`
                type User {
                    name: String
                    age: Int
                    address: Address
                }

                type Query {
                    getUserByID(id: ID!): User
                }
            `,
            resolvers: {
                Query: { getUserByID: () => true },
                Fields: {
                    age: () => 20
                }
            }
        });

        const { typeDefs, resolvers, schema } = combineNodes([UserNode], {
            schemaGlobals: gql`
                type Address {
                    line1: String
                    line2: String
                    postcode: String
                }
            `
        });

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type User");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("type Address");

        expect(typeDefs)
            .to.be.a("string")
            .to.contain("schema");

        expect(schema).to.be.a.instanceOf(GraphQLSchema);

        expect(resolvers)
            .to.be.an("object")
            .to.have.property("Query")
            .to.have.property("getUserByID")
            .to.be.a("function");
    });

    it("should throw name already registered", () => {
        try {
            const node1 = new GraphQLNode({
                name: "User",
                typeDefs: gql`
                    type User {
                        name: String
                        age: Int
                    }

                    type Query {
                        getUserByID(id: ID!): User
                    }
                `,
                resolvers: {
                    Query: {
                        getUserByID: () => true
                    }
                }
            });

            const node2 = new GraphQLNode({
                name: "User",
                typeDefs: gql`
                    type User {
                        name: String
                        age: Int
                    }

                    type Query {
                        getUserByID(id: ID!): User
                    }
                `,
                resolvers: {
                    Query: {
                        getUserByID: () => true
                    }
                }
            });

            combineNodes([node1, node2]);

            throw new Error();
        } catch (error) {
            expect(error.message)
                .to.be.a("string")
                .to.contain("GraphQLNode with name: 'User' already registered");
        }
    });

    it("should throw nodes typeDefs should contain a ObjectTypeDefinition called node.name", () => {
        try {
            const node = new GraphQLNode({
                name: "User",
                typeDefs: gql`
                    type post {
                        title: String
                        description: Int
                    }

                    type Mutation {
                        likePost(id: ID!): post
                    }
                `,
                resolvers: {
                    Mutation: {
                        likePost: () => true
                    }
                }
            });

            combineNodes([node]);

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "GraphQLNode with name: 'User' should contain a ObjectTypeDefinition called 'User'"
            );
        }
    });

    it("GraphQLNode with name has a Field resolver called thats not defined in typeDefs`", () => {
        try {
            const node = new GraphQLNode({
                name: "Post",
                typeDefs: gql`
                    type Post {
                        title: String
                        description: Int
                    }

                    type Mutation {
                        likePost(id: ID!): Post
                    }
                `,
                resolvers: {
                    Mutation: {
                        likePost: () => true
                    },
                    Fields: {
                        random: () => true
                    }
                }
            });

            combineNodes([node]);

            throw new Error();
        } catch (error) {
            expect(error.message)
                .to.be.a("string")
                .to.contain(
                    "GraphQLNode with name: 'Post' has a Field resolver called 'random' thats not defined in typeDefs"
                );
        }
    });

    it("should throw could not parseTypeDefs", () => {
        try {
            const node = new GraphQLNode({
                name: "Post",
                typeDefs: path.join(
                    __dirname,
                    "../../dummy-data/Error-Post.gql"
                ),
                resolvers: {
                    Mutation: {
                        likePost: () => true
                    },
                    Fields: {
                        random: () => true
                    }
                }
            });

            combineNodes([node]);

            throw new Error();
        } catch (error) {
            expect(error.message)
                .to.be.a("string")
                .to.contain(
                    `GraphQLNode with name: 'Post' could not parse typeDefs`
                );
        }
    });

    it("should throw when loading IdioEnum with invalid typeDefs from a file", () => {
        try {
            const _Enum = new IdioEnum({
                name: "Status",
                typeDefs: path.join(__dirname, "../../dummy-data/error.gql"),
                resolver: {}
            });

            const node = new GraphQLNode({
                name: "Post",
                typeDefs: gql`
                    type Post {
                        title: String
                        description: Int
                    }

                    type Mutation {
                        likePost(id: ID!): Post
                    }
                `,
                resolvers: {
                    Mutation: {
                        likePost: () => true
                    }
                }
            });

            combineNodes([node], { enums: [_Enum] });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "IdioEnum with name: 'Status' could not parse typeDefs"
            );
        }
    });

    it("should throw enum should contain EnumTypeDefinition", () => {
        try {
            const _Enum = new IdioEnum({
                name: "Status",
                typeDefs: gql`
                    enum notStatus {
                        ONLINE
                        OFFLINE
                    }
                `,
                resolver: {
                    ONLINE: "online",
                    OFFLINE: "offline"
                }
            });

            const node = new GraphQLNode({
                name: "Post",
                typeDefs: gql`
                    type Post {
                        title: String
                        description: Int
                    }

                    type Mutation {
                        likePost(id: ID!): Post
                    }
                `,
                resolvers: {
                    Mutation: {
                        likePost: () => true
                    }
                },
                enums: [_Enum]
            });

            combineNodes([node]);

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "IdioEnum with name: 'Status' should contain a EnumTypeDefinition called 'Status'"
            );
        }
    });

    it("should throw when loading IdioDirective with invalid typeDefs from a file", () => {
        try {
            const { isAuthenticated } = AuthDirective();

            const hasScopeDirective = new IdioDirective({
                name: "hasScope",
                typeDefs: path.join(__dirname, "../../dummy-data/error.gql"),
                resolver: isAuthenticated
            });

            const node = new GraphQLNode({
                name: "Post",
                typeDefs: gql`
                    type Post {
                        title: String
                        description: Int
                    }

                    type Mutation {
                        likePost(id: ID!): Post
                    }
                `,
                resolvers: {
                    Mutation: {
                        likePost: () => true
                    }
                }
            });

            combineNodes([node], { directives: [hasScopeDirective] });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "IdioDirective with name: 'hasScope' could not parse typeDefs \n"
            );
        }
    });

    it("should throw directive should contain DirectiveDefinition", () => {
        try {
            const { isAuthenticated } = AuthDirective();

            const hasScopeDirective = new IdioDirective({
                name: "hasScope",
                typeDefs: gql`
                    directive @hasScopeee(scopes: [String]!) on FIELD_DEFINITION
                `,
                resolver: isAuthenticated
            });

            const node = new GraphQLNode({
                name: "Post",
                typeDefs: gql`
                    type Post {
                        title: String
                        description: Int
                    }

                    type Mutation {
                        likePost(id: ID!): Post
                    }
                `,
                resolvers: {
                    Mutation: {
                        likePost: () => true
                    }
                }
            });

            combineNodes([node], { directives: [hasScopeDirective] });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "IdioDirective with name: 'hasScope' should contain a DirectiveDefinition called 'hasScope'"
            );
        }
    });

    it("should throw creating scalar with name already registered", () => {
        try {
            const JSONScalar = new IdioScalar({
                name: "JSON",
                resolver: GraphQLJSON
            });

            const JSONScalar2 = new IdioScalar({
                name: "JSON",
                resolver: GraphQLJSON
            });

            const UserNode = new GraphQLNode({
                name: "User",
                typeDefs: gql`
                    type User {
                        name: String
                        age: Int
                    }

                    type Query {
                        getUserByID(id: ID!): User
                    }
                `,
                resolvers: {
                    Query: { getUserByID: () => true }
                }
            });

            combineNodes([UserNode], {
                scalars: [JSONScalar, JSONScalar2]
            });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "loading IdioScalar with a name: 'JSON' thats already registered"
            );
        }
    });
});
