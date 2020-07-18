const { SchemaDirectiveVisitor } = require("@graphql-tools/utils");
const {
    DirectiveLocation,
    GraphQLDirective,
    defaultFieldResolver
} = require("graphql");

class isAuthenticated extends SchemaDirectiveVisitor {
    static getDirectiveDeclaration(directiveName = "isAuthenticated") {
        return new GraphQLDirective({
            name: directiveName,
            locations: [DirectiveLocation.FIELD_DEFINITION]
        });
    }

    visitFieldDefinition(field) {
        const { resolve = defaultFieldResolver } = field;

        field.resolve = (root, args, context, info) => {
            const auth = "test";

            return resolve.call(this, root, args, { ...context, auth }, info);
        };
    }
}

module.exports = isAuthenticated;
