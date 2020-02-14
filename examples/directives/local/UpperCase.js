const { SchemaDirectiveVisitor } = require("graphql-tools");
const { defaultFieldResolver } = require("graphql");
const { gql } = require("apollo-server");
const { IdioDirective } = require("../../../../src/index.js");

class UpperCaseDirective extends SchemaDirectiveVisitor {
    // eslint-disable-next-line class-methods-use-this
    visitFieldDefinition(field) {
        const { resolve = defaultFieldResolver } = field;
        field.resolve = async function (...args) {
            const result = await resolve.apply(this, args);

            if (typeof result === "string") {
                return result.toUpperCase();
            }

            return result;
        };
    }
}

const UpperCase = new IdioDirective({
    name: "upper",
    typeDefs: gql`
        directive @upper on FIELD_DEFINITION
    `,
    resolver: UpperCaseDirective
});

module.exports = UpperCase;
