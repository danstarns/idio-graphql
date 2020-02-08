const { expect } = require("chai");
const path = require("path");
const { parse } = require("graphql/language");

const parseTypeDefs = require("../../src/util/parse-typedefs.js");

describe("parseTypeDefs", () => {
    it("should return a promise that resolves a file", () => {
        const filePath = path.join(__dirname, "../dummy-data/User.gql");

        const result = parseTypeDefs(filePath);

        expect(result).to.be.a("string");
        expect(result).to.contain("type User");
        expect(result).to.contain("type Query");
    });

    it("should throw error parsing typeDefs when providing invalid SDL from string", () => {
        try {
            parseTypeDefs(
                `terp User {
                    name: String
                    age: Int
                
                terp QUery {
                    getUserById(id: ID!!!); User
                ]    `
            );

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain("cannot resolve typeDefs");
        }
    });

    it("should return a promise that resolves the initial string provided", async () => {
        const result = parseTypeDefs(`
            type User {
                name: String
                age: Int
            }
            
            type Query {
                getUserByID(id: ID!): User
            }
        `);

        expect(result).to.be.a("string");
        expect(result).to.contain("type User");
        expect(result).to.contain("type Query");
    });

    it("should return a promise that resolves<String> from gql-tag/AST", async () => {
        const GQLTagResult = parse(`
            type User {
                name: String
                age: Int
            }
            
            type Query {
                getUserByID(id: ID!): User
            }
        `);

        const result = parseTypeDefs(GQLTagResult);

        expect(result).to.be.a("string");
        expect(result).to.contain("type User");
        expect(result).to.contain("type Query");
    });

    it("should throw cannot resolve typeDefs when invalid AST is provided", () => {
        try {
            parseTypeDefs({ invalid: "AST" });

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain("cannot resolve typeDefs: ");
        }
    });

    it("should throw cannot parse typeDefs when a number is provided", () => {
        try {
            parseTypeDefs(278);

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain("cannot parse typeDefs: 278");
        }
    });
});
