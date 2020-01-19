/* eslint-disable default-case */
const util = require("util");
const IdioError = require("../../idio-error.js");
const CONTEXT_INDEX = require("../../../constants/context-index.js");

const sleep = util.promisify(setTimeout);

/**
 * @typedef {import('moleculer').BrokerOptions} BrokerOptions
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 */

module.exports = ({ type }) => {
    if (type === "IdioUnion") {
        type = "union";
    } else if (type === "IdioInterface") {
        type = "interface";
    } else if (type === "IdioEnum") {
        type = "enum";
    }

    /**
     *
     * @param {BrokerOptions} brokerOptions
     */
    async function _serveAppliance(brokerOptions) {
        this.name;
        this.typeDefs;
        this.resolver;

        let moleculer = {};
        let initialized = false;

        if (!brokerOptions) {
            throw new IdioError("brokerOptions required.");
        }

        if (!brokerOptions.transporter) {
            throw new IdioError("brokerOptions.transporter required.");
        }

        try {
            // eslint-disable-next-line global-require
            moleculer = require("moleculer");
        } catch (error) {
            throw new IdioError(
                `Cant find module: 'moleculer' install using npm install --save moleculer`
            );
        }

        const { ServiceBroker } = moleculer;

        /** @type {ServiceBroker} */
        const broker = new ServiceBroker({
            ...brokerOptions,
            nodeID: this.name
        });

        let introspection;

        if (type === "enum") {
            introspection = {
                name: this.name,
                typeDefs: await this.typeDefs(),
                resolver: this.resolver
            };

            broker.createService({
                name: this.name,
                actions: {
                    introspection: ({ params: { gateway } = {} } = {}) => {
                        initialized = true;

                        broker.logger.info(
                            `Connected to GraphQLGateway: '${gateway}'.`
                        );

                        return introspection;
                    }
                }
            });
        } else {
            introspection = {
                name: this.name,
                typeDefs: await this.typeDefs()
            };

            broker.createService({
                name: this.name,
                actions: {
                    introspection: ({ params: { gateway } = {} } = {}) => {
                        initialized = true;

                        broker.logger.info(
                            `Connected to GraphQLGateway: '${gateway}'.`
                        );

                        return introspection;
                    },
                    __resolveType: (ctx) => {
                        const {
                            params: { graphQLArgs = JSON.stringify([]) } = {}
                        } = ctx;

                        const decodedArgs = JSON.parse(graphQLArgs);

                        const context = decodedArgs[CONTEXT_INDEX - 1];

                        if (!context) {
                            decodedArgs[CONTEXT_INDEX - 1] = {};
                        }

                        decodedArgs[CONTEXT_INDEX - 1].broker = broker;

                        return this.resolver.__resolveType(...decodedArgs);
                    }
                }
            });
        }

        await broker.start();

        const introspectionCall = async (resolve, reject) => {
            try {
                await broker.emit(`introspection.request`, { type });
            } catch (e) {
                e;
            }

            await sleep(1000);

            if (!initialized) {
                setImmediate(introspectionCall, resolve, reject);
            } else {
                return resolve();
            }
        };

        await new Promise(introspectionCall);

        return broker;
    }

    return _serveAppliance;
};
