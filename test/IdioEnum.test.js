/* eslint-disable no-unused-vars */
const { expect } = require("chai");
const path = require("path");
const IdioEnum = require("../src/IdioEnum.js");

describe("IdioEnum", () => {
    it("should throw name required", (done) => {
        try {
            const _enum = new IdioEnum();
        } catch (error) {
            expect(error.message).to.contain("IdioEnum: name required");

            done();
        }
    });

    it("should throw name should be a string", (done) => {
        try {
            const _enum = new IdioEnum({ name: [] });
        } catch (error) {
            expect(error.message).to.contain(
                "IdioEnum: name must be of type 'string'"
            );

            done();
        }
    });

    it("should throw typeDefs required", (done) => {
        try {
            const _enum = new IdioEnum({ name: "Pets" });
        } catch (error) {
            expect(error.message).to.contain(
                "IdioEnum: creating Enum: 'Pets' typeDefs required"
            );

            done();
        }
    });

    it("should throw typeDefs should be a string", (done) => {
        try {
            const _enum = new IdioEnum({ name: "Pets", typeDefs: [] });
        } catch (error) {
            expect(error.message).to.contain(
                "IdioEnum: creating Enum: 'Pets' typeDefs must be of type 'string'"
            );

            done();
        }
    });

    it("should throw creating Enum without resolver", (done) => {
        try {
            const _enum = new IdioEnum({
                name: "Pets",
                typeDefs: "./dummy-data/Pets-Enum.gql"
            });
        } catch (error) {
            expect(error.message).to.contain(
                "IdioEnum: creating Enum: 'Pets' without a resolver"
            );

            done();
        }
    });

    it("should typeDefs path dont exist", (done) => {
        try {
            const _enum = new IdioEnum({
                name: "Pets",
                typeDefs: "././random.gql",
                resolver: {}
            });
        } catch (error) {
            expect(error.message).to.contain("does not exist");

            done();
        }
    });

    it("should not append the caller path to the typeDefs and return IdioEnum", (done) => {
        const _enum = new IdioEnum({
            name: "Pets",
            typeDefs: path.normalize(
                path.join(__dirname, "./dummy-data/Pets-Enum.gql")
            ),
            resolver: {}
        });

        expect(_enum)
            .to.have.property("name")
            .to.be.a("string");

        expect(_enum)
            .to.have.property("typeDefs")
            .to.be.a("string");

        expect(_enum)
            .to.have.property("resolver")
            .to.be.a("object");

        done();
    });

    it("should append the caller path to the typeDefs and return IdioEnum", (done) => {
        const _enum = new IdioEnum({
            name: "Pets",
            typeDefs: "./dummy-data/Pets-Enum.gql",
            resolver: {}
        });

        expect(_enum)
            .to.have.property("name")
            .to.be.a("string");

        expect(_enum)
            .to.have.property("typeDefs")
            .to.be.a("string");

        expect(_enum)
            .to.have.property("resolver")
            .to.be.a("object");

        done();
    });
});
