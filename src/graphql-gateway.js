const { ServiceBroker } = require("moleculer");
const combineNodes = require("./combine-nodes.js");
const GraphQLNode = require("./graphql-node.js");
const IdioError = require("./idio-error.js");
const sleep = require("util").promisify(setTimeout);

function GraphQLGateway({ dependencies, name }, brokerOptions) {
    this.dependencies = [];
    this.broker;
    this.REGISTERED_SERVICES = [];
    this.WAITING_SERVICES = [];
    this.start;

    brokerOptions.nodeID = name || "gateway";

    if (dependencies) {
        if (!Array.isArray(dependencies)) {
            throw new IdioError("dependencies must be of type Array.<string>.");
        }

        if (!dependencies.length) {
            throw new IdioError("you must have 1 or more dependencies");
        }

        dependencies.forEach((dependency) => {
            if (!(typeof dependency === "string")) {
                throw new IdioError(
                    "dependencies must be of type Array.<string>."
                );
            }
        });

        this.dependencies = [...new Set([...dependencies])];
        this.WAITING_SERVICES = [...this.dependencies];
    }

    this.broker = new ServiceBroker({
        ...brokerOptions,
        namespace: "idio-graphql"
    });

    this.broker.introspectionService = this.broker.createService({
        name: `${brokerOptions.nodeID}:introspection`,
        actions: {
            squawk: ({ params: { introspection } = {} } = {}) => {
                if (this.dependencies.includes(introspection.name)) {
                    this.WAITING_SERVICES = this.WAITING_SERVICES.filter(
                        (x) => x !== introspection.name
                    );
                }

                this.REGISTERED_SERVICES.push(introspection);

                return true;
            }
        }
    });
}

async function start() {
    await this.broker.start();

    const checkForServices = async (resolve, reject) => {
        if (this.WAITING_SERVICES.length) {
            console.warn(
                `Waiting for services: ${this.WAITING_SERVICES.join(", ")}`
            );

            await sleep(1000);

            return setImmediate(() => checkForServices(resolve, reject));
        }

        return resolve();
    };

    await new Promise(checkForServices);

    const createLocalNode = (introspection) => {
        return new GraphQLNode({
            ...introspection,
            resolvers: Object.entries(introspection.resolvers).reduce(
                (result, [type, methods]) => ({
                    ...result,
                    [type]: methods.reduce(
                        (res, resolver) => ({
                            ...res,
                            [resolver]: async (...graphQLArgs) => {
                                try {
                                    const response = await this.broker.call(
                                        `${introspection.name}:${type}.${resolver}`,
                                        { graphQLArgs }
                                    );

                                    return response;
                                } catch (error) {
                                    throw new IdioError(
                                        `Can't communicate with service: '${introspection.name}, Error:\n${error}'`
                                    );
                                }
                            }
                        }),
                        {}
                    )
                }),
                {}
            )
        });
    };

    const nodes = this.REGISTERED_SERVICES.map(createLocalNode);

    const { typeDefs, resolvers } = await combineNodes(nodes);

    return { typeDefs, resolvers };
}

GraphQLGateway.prototype.start = start;

module.exports = GraphQLGateway;
