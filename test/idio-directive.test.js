/* eslint-disable no-unused-vars */
const { expect } = require("chai");
const IdioDirective = require("../src/idio-directive.js");

describe("IdioDirective", () => {
    it("should throw name required", () => {
        try {
            const directive = new IdioDirective();
        } catch (error) {
            expect(error.message).to.contain("IdioDirective: name required");
        }
    });

    it("should throw name must be of type string", () => {
        try {
            const directive = new IdioDirective({ name: [] });
        } catch (error) {
            expect(error.message).to.contain(
                "IdioDirective: name must be of type 'string'"
            );
        }
    });

    it("should throw typeDefs required", () => {
        try {
            const directive = new IdioDirective({ name: "hasPermission" });
        } catch (error) {
            expect(error.message).to.contain(
                "IdioDirective: creating Directive: 'hasPermission' typeDefs required"
            );
        }
    });

    it("should throw error parsing typeDefs", () => {
        try {
            const directive = new IdioDirective({
                name: "hasPermission",
                typeDefs: `dhjdklh`
            });
        } catch (error) {
            expect(error.message).to.contain(
                "IdioDirective: creating Directive: 'hasPermission' Error: "
            );
        }
    });

    it("should throw resolver required", () => {
        try {
            const directive = new IdioDirective({
                name: "hasPermission",
                typeDefs: `
                input permissionInput {
                    resource: String!
                    action: String!
                }
                
                directive @hasPermission(
                    permission: permissionInput!
                ) on FIELD_DEFINITION 
            `
            });
        } catch (error) {
            expect(error.message).to.contain(
                "IdioDirective: creating Directive: 'hasPermission' without a resolver"
            );
        }
    });

    it("should create and return a instance of IdioDirective", () => {
        const directive = new IdioDirective({
            name: "hasPermission",
            typeDefs: `
            input permissionInput {
                resource: String!
                action: String!
            }
            
            directive @hasPermission(
                permission: permissionInput!
            ) on FIELD_DEFINITION 
        `,
            resolver: () => true
        });

        expect(directive)
            .to.have.property("name")
            .to.be.a("string")
            .to.equal("hasPermission");

        expect(directive)
            .to.have.property("typeDefs")
            .to.be.a("function");

        expect(directive)
            .to.have.property("resolver")
            .to.be.a("function");
    });
});
