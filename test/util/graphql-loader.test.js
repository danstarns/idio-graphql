/* eslint-disable import/no-dynamic-require */
const { expect } = require("chai");
const path = require("path");

const { SOURCE_PATH = "src" } = process.env;

const graphQLLoader = require(`../../${SOURCE_PATH}/util/graphql-loader.js`);

describe("graphQLLoader", () => {
    it("should throw filePath required", async () => {
        try {
            await graphQLLoader();

            throw new Error();
        } catch (error) {
            expect(error.message).to.contain(
                "graphQLLoader: filePath required"
            );
        }
    });

    it("should load and return a graphql file as a string", async () => {
        const result = await graphQLLoader(
            path.join(__dirname, "../dummy-data/User.gql")
        );

        expect(result)
            .to.be.a("string")
            .to.contain(`type User`);
    });

    it("should throw fs error when cant access file", async () => {
        try {
            await graphQLLoader("./snjkf/ajhdks/fanjdfkashjkfajhjeywbjbjko");

            throw new Error();
        } catch (error) {
            expect(error.message).to.be.a("string");
        }
    });
});
