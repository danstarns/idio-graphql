const { expect } = require("chai");
const path = require("path");
const { graphQLLoader } = require("../src/index.js");

describe("GraphQLLoader", () => {
    it("should throw filePath required", (done) => {
        graphQLLoader().catch((err) => {
            expect(err.message).to.include("graphQLLoader: filePath required");

            done();
        });
    });

    it("should throw ENOENT error", (done) => {
        graphQLLoader("./some/random/unreal/path/to/nowhere.js").catch(
            (err) => {
                expect(err.message).to.include("ENOENT");

                done();
            }
        );
    });

    it("should load and return the graphql file as a string", (done) => {
        graphQLLoader(path.join(__dirname, "dummy-data/User.gql"))
            .then((res) => {
                expect(res).to.include("type User {");

                done();
            })
            .catch(console.log);
    });
});
