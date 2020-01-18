/* eslint-disable default-case */
const util = require("util");
const IdioError = require("../../idio-error.js");
const CONTEXT_INDEX = require("../../../constants/context-index.js");

/**
 * @typedef {import("moleculer").BrokerOptions} brokerOptions
 */

const sleep = util.promisify(setTimeout);

/**
 *
 * @param {brokerOptions} brokerOptions
 */
async function serveEnum(brokerOptions) {
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

    const broker = new ServiceBroker({
        ...brokerOptions,
        nodeID: this.name
    });

    const introspection = {
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

    await broker.start();

    const introspectionCall = async (resolve, reject) => {
        try {
            await broker.emit(`introspection.request`, { type: "enum" });
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

const serveAppliance = (type) => {
    if (type === "IdioUnion") {
        type = "union";
    } else if (type === "IdioInterface") {
        type = "interface";
    }

    /**
     *
     * @param {brokerOptions} brokerOptions
     */
    return async function _serveAppliance(brokerOptions) {
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

        const broker = new ServiceBroker({
            ...brokerOptions,
            nodeID: this.name
        });

        const introspection = {
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
                    ctx.params.graphQLArgs[CONTEXT_INDEX - 1].broker = broker;

                    return this.resolver.__resolveType(
                        ...ctx.params.graphQLArgs
                    );
                }
            }
        });

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
    };
};

module.exports = ({ type }) => {
    switch (type) {
        case "IdioEnum":
            return serveEnum;
        case "IdioUnion":
            return serveAppliance(type);
        case "IdioInterface":
            return serveAppliance(type);
    }
};
