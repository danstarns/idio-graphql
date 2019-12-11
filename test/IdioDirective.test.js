/* eslint-disable no-unused-vars */
const { expect } = require("chai");
const path = require("path");
const IdioDirective = require("../src/IdioDirective.js");

describe("IdioDirective", () => {
    it("should throw name required", (done) => {
        try {
            const _enum = new IdioDirective();
        } catch (error) {
            expect(error.message).to.contain("IdioDirective: name required");

            done();
        }
    });

    it("should throw name should be a string", (done) => {
        try {
            const _enum = new IdioDirective({ name: [] });
        } catch (error) {
            expect(error.message).to.contain(
                "IdioDirective: name must be of type 'string'"
            );

            done();
        }
    });

    it("should throw typeDefs required", (done) => {
        try {
            const _enum = new IdioDirective({ name: "Pets" });
        } catch (error) {
            expect(error.message).to.contain(
                "IdioDirective: creating Directive: 'Pets' typeDefs required"
            );

            done();
        }
    });

    it("should throw typeDefs should be a string", (done) => {
        try {
            const _enum = new IdioDirective({ name: "Pets", typeDefs: [] });
        } catch (error) {
            expect(error.message).to.contain(
                "IdioDirective: creating Directive: 'Pets' typeDefs must be of type 'string'"
            );

            done();
        }
    });

    it("should throw creating Directive without resolver", (done) => {
        try {
            const _enum = new IdioDirective({
                name: "Pets",
                typeDefs: "./dummy-data/Pets-Directive.gql"
            });
        } catch (error) {
            expect(error.message).to.contain(
                "IdioDirective: creating Directive: 'Pets' without a resolver"
            );

            done();
        }
    });

    it("should typeDefs path dont exist", (done) => {
        try {
            const _enum = new IdioDirective({
                name: "Pets",
                typeDefs: "././random.gql",
                resolver: {}
            });
        } catch (error) {
            expect(error.message).to.contain("does not exist");

            done();
        }
    });

    it("should not append the caller path to the typeDefs and return IdioDirective", (done) => {
        const _enum = new IdioDirective({
            name: "Pets",
            typeDefs: path.normalize(
                path.join(__dirname, "./dummy-data/Auth-directive.gql")
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

    it("should append the caller path to the typeDefs and return IdioDirective", (done) => {
        const _enum = new IdioDirective({
            name: "Pets",
            typeDefs: "./dummy-data/Auth-directive.gql",
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
