const { expect } = require("chai");
const { parse } = require("graphql/language/parser");
const extractResolvers = require("../../src/util/extract-resolvers.js");

describe("extractResolvers", () => {
    it("should return an array of Querys", () => {
        const ast = parse(
            `
            type Query {
                user: User
                userById(id: ID): User
            }
        `
        );

        const result = extractResolvers(ast, "Query");

        expect(result)
            .to.be.a("array")
            .lengthOf(2);

        expect(result).to.include("user");
        expect(result).to.include("userById");
    });

    it("should return an array of Querys when using ObjectTypeExtension", () => {
        const ast = parse(
            `
            extend type Query {
                user: User
                userById(id: ID): User
            }
        `
        );

        const result = extractResolvers(ast, "Query");

        expect(result)
            .to.be.a("array")
            .lengthOf(2);

        expect(result).to.include("user");
        expect(result).to.include("userById");
    });

    it("should return empty array if no resolvers defined", () => {
        const ast = parse(
            `
            enum status {
                ONLINE
                OFFLINE
            }
        `
        );

        const result = extractResolvers(ast, "Query");

        expect(result)
            .to.be.a("array")
            .lengthOf(0);
    });
});
