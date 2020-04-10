/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-classes-per-file */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ServiceBroker, BrokerOptions } from "moleculer";
import { DocumentNode, ExecutionResult, GraphQLSchema } from "graphql";

declare namespace IdioGraphQL {
    interface IdioBrokerOptions extends BrokerOptions {
        gateway: string;
    }

    type ResolveType = (
        obj: { [k: string]: any },
        context: { [k: string]: any },
        info: any
    ) => any;

    /**
     * You can use IdioDirective to modularize a DirectiveDefinition,
     * together with its resolver. You can only specify directives 'top-level'
     * at combineNodes.
     */
    class IdioScalar {
        name: string;

        typeDefs: string;

        /** @type {GraphQLScalarType} */
        resolver: any;

        constructor(input: {
            name: string;
            /** @type {GraphQLScalarType} */ resolver: any;
        });
    }

    /**
     * You can use IdioDirective to modularize a DirectiveDefinition,
     * together with its resolver. You can only specify directives 'top-level'
     * at combineNodes.
     */
    class IdioDirective {
        name: string;

        typeDefs: string;

        /** @type {SchemaDirectiveVisitor} */
        resolver: any;

        constructor(input: {
            name: string;
            typeDefs: string | DocumentNode;
            /** @type {SchemaDirectiveVisitor} */ resolver: any;
        });
    }

    /**
     * You can use IdioUnion to modularize a UnionTypeDefinition,
     * together with its resolver. You can specify unions 'top-level'
     * at combineNodes or at an GraphQLNode level.
     */
    class IdioUnion {
        name: string;

        typeDefs: string;

        resolver: {
            __resolveType: ResolveType;
        };

        constructor(input: {
            name: string;
            typeDefs: string | DocumentNode;
            resolver: {
                __resolveType: ResolveType;
            };
        });

        serve: (brokerOptions: IdioBrokerOptions) => Promise<ServiceBroker>;
    }

    /**
     * You can use IdioInterface to modularize a InterfaceTypeDefinition,
     * together with its resolver. You can specify interfaces 'top-level'
     * at combineNodes or at an GraphQLNode level.
     */
    class IdioInterface {
        name: string;

        typeDefs: string;

        resolver: {
            __resolveType: ResolveType;
        };

        constructor(input: {
            name: string;
            typeDefs: string | DocumentNode;
            resolver: {
                __resolveType: ResolveType;
            };
        });

        serve: (brokerOptions: IdioBrokerOptions) => Promise<ServiceBroker>;
    }

    /**
     * You can use IdioEnum to modularize a EnumTypeDefinition,
     * together with its resolver. You can specify enums 'top-level'
     * at combineNodes or at an GraphQLNode level.
     */
    class IdioEnum {
        name: string;

        typeDefs: string;

        resolver: { [k: string]: any };

        constructor(input: {
            name: string;
            typeDefs: string | DocumentNode;
            resolver: { [k: string]: any };
        });

        serve: (brokerOptions: IdioBrokerOptions) => Promise<ServiceBroker>;
    }

    type InterSchemaExecute = (
        document: DocumentNode | string,
        executionContext?: {
            root?: any;
            context?: { [k: string]: any };
            variables?: { [k: string]: any };
            operationName?: string;
        }
    ) => Promise<ExecutionResult>;

    interface Context {
        injections: {
            execute: InterSchemaExecute;
            broker?: ServiceBroker;
        };
    }

    type PreHook = (
        root: any,
        args: { [k: string]: any },
        context: Context,
        info: DocumentNode
    ) => void;

    type PostHook = (
        resolve: any,
        root: any,
        args: { [k: string]: any },
        context: Context,
        info: DocumentNode
    ) => void;

    type Resolve = (
        root: any,
        args: { [k: string]: any },
        context: Context,
        info: DocumentNode
    ) => void;

    interface ResolverObjectInput {
        resolve: Resolve;
        pre: PreHook;
        post: PostHook;
    }

    type ResolverUnion = Resolve | ResolverObjectInput;

    interface Resolvers {
        Query?: {
            [k: string]: ResolverUnion;
        };
        Mutation?: {
            [k: string]: ResolverUnion;
        };
        Subscription?: {
            [k: string]: {
                subscribe: AsyncGenerator;
            };
        };
        Fields?: {
            [k: string]: ResolverUnion;
        };
    }

    /**
     * You can use GraphQLNode to modularize a ObjectTypeDefinition
     * together with its related resolvers & properties.
     */
    class GraphQLNode {
        name: string;

        typeDefs: string;

        resolvers: Resolvers;

        nodes?: GraphQLNode[];

        injections?: { [k: string]: any; execute: InterSchemaExecute };

        enums?: IdioEnum[];

        interfaces?: IdioInterface[];

        unions?: IdioUnion[];

        types?: GraphQLType[];

        constructor(input: {
            name: string;
            typeDefs: string | DocumentNode;
            resolvers: Resolvers;
            nodes?: GraphQLNode[];
            injections?: { [k: string]: any };
            enums?: IdioEnum[];
            interfaces?: IdioInterface[];
            unions?: IdioUnion[];
            types?: GraphQLType[];
        });

        serve: (brokerOptions: IdioBrokerOptions) => Promise<ServiceBroker>;
    }

    /**
     * You can use GraphQLType to modularize a ObjectTypeDefinition,
     * together with its Field resolvers. You can specify types 'top-level'
     * at combineNodes or at an GraphQLNode level.
     */
    class GraphQLType {
        name: string;

        typeDefs: string;

        resolvers: { [k: string]: ResolverUnion };

        injections?: { [k: string]: any };

        constructor(input: {
            name: string;
            typeDefs: string | DocumentNode;
            resolvers: { [k: string]: ResolverUnion };
            injections?: { [k: string]: any };
        });

        serve: (brokerOptions: IdioBrokerOptions) => Promise<ServiceBroker>;
    }

    interface Appliances {
        nodes?: GraphQLNode[];
        enums?: IdioEnum[];
        interfaces?: IdioInterface[];
        unions?: IdioUnion[];
        types?: GraphQLType[];
        scalars?: IdioScalar[];
        directives?: IdioDirective[];
        schemaGlobals?: string | string[] | DocumentNode | DocumentNode[];
    }

    /**
     * You can use combineNodes to snap GraphQLNode's &
     * Schema Appliances together into a single Schema.
     */
    function combineNodes(
        nodes: GraphQLNode[],
        appliances?: Appliances
    ): {
        schema: GraphQLSchema;
        typeDefs: string;
        resolvers: { [k: string]: any };
        schemaDirectives?: { [k: string]: any };
        execute: InterSchemaExecute;
    };

    interface Locals {
        nodes?: GraphQLNode[];
        enums?: IdioEnum[];
        interfaces?: IdioInterface[];
        unions?: IdioUnion[];
        types?: GraphQLType[];
        scalars?: IdioScalar[];
        directives?: IdioDirective[];
        schemaGlobals?: string | string[] | DocumentNode | DocumentNode[];
    }

    interface Services {
        nodes?: string[];
        enums?: string[];
        interfaces?: string[];
        unions?: string[];
        types?: string[];
    }

    /**
     * You can use GraphQLGateway to orchestrate a collection of GraphQLNode's
     * & Schema Appliances exposed over a network.
     */
    class GraphQLGateway {
        broker: ServiceBroker;

        constructor(
            config: { services?: Services; locals?: Locals },
            brokerOptions: BrokerOptions
        );

        start: () => Promise<{
            schema: GraphQLSchema;
            typeDefs: string;
            resolvers: { [k: string]: any };
            schemaDirectives?: { [k: string]: any };
            execute: InterSchemaExecute;
            broker: ServiceBroker;
        }>;
    }
}

export = IdioGraphQL;
