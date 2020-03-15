const { expect } = require("chai");
const proxyquire = require("proxyquire");
const {
    printWithComments,
    mergeTypeDefs
} = require("@graphql-toolkit/schema-merging");

function loadAppliances(appliances, metadata) {
    if (!appliances) {
        throw new Error("not appliances");
    }

    if (!(typeof metadata === "object")) {
        throw new Error("metadata must be of type object");
    }

    if (typeof appliances === "string") {
        return {
            typeDefs: appliances
        };
    }

    return appliances.reduce(
        (res, { name, typeDefs, resolver, resolvers }) => {
            let _resolvers;

            if (name === "User") {
                _resolvers = { ...res.resolvers, [name]: resolvers }; // GraphQLType
            } else {
                _resolvers = { ...res.resolvers, [name]: resolver };
            }

            return {
                ...res,
                typeDefs: printWithComments(
                    mergeTypeDefs([...res.typeDefs, typeDefs])
                ),
                resolvers: _resolvers
            };
        },
        { typeDefs: [], resolvers: {} }
    );
}

const reduceAppliances = proxyquire(
    "../../../../src/api/combine_nodes/methods/reduce-appliances.js",
    { "../../appliances/methods/load-appliances.js": loadAppliances }
);

describe("reduce appliances", () => {
    it("should reduce appliances", async () => {
        const RUNTIME = {
            schema: {}
        };

        const result = reduceAppliances(
            {
                unions: [
                    {
                        name: "Union",
                        typeDefs: "union Union",
                        resolver: () => ({ test: true })
                    }
                ],
                schemaGlobals: "type Global",
                directives: [
                    {
                        name: "hasPermission",
                        typeDefs: ` directive @hasPermission(
                        permission: permissionInput!
                    ) on FIELD_DEFINITION `,
                        resolver: () => ({ test: true })
                    }
                ],
                interfaces: [],
                types: [
                    {
                        name: "User",
                        typeDefs: `
                        type User {
                            feet: Int
                        }
                    `,
                        resolvers: {
                            feet: () => 2
                        }
                    }
                ],
                nometadata: [
                    {
                        name: "noMeatadata",
                        typeDefs: ` directive @noMeatadata(
                    permission: permissionInput!
                ) on FIELD_DEFINITION `,
                        resolver: () => ({ test: true })
                    }
                ]
            },
            RUNTIME
        );

        expect(result)
            .to.be.a("object")
            .to.have.property("resolvers")
            .to.be.a("object");

        expect(result.resolvers.Union).to.be.a("function");

        expect(result.resolvers.Union()).to.eql({ test: true });

        expect(result.resolvers.User)
            .to.be.a("object")
            .to.have.property("feet");

        expect(await result.resolvers.User.feet()).to.equal(2);

        expect(result)
            .to.be.a("object")
            .to.have.property("schemaDirectives")
            .to.be.a("object");

        expect(result.schemaDirectives.hasPermission).to.be.a("function");

        expect(result.schemaDirectives.hasPermission()).to.eql({ test: true });

        expect(result)
            .to.be.a("object")
            .to.have.property("typeDefs")
            .to.be.a("array");

        const typeDefs = printWithComments(mergeTypeDefs(result.typeDefs));

        expect(typeDefs).to.be.a("string");

        expect(typeDefs).to.contain("directive @hasPermission");

        expect(typeDefs).to.contain("type Global");

        expect(typeDefs).to.contain("union Union");

        expect(typeDefs).to.contain("type User");
    });
});
