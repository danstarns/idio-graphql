const util = require("util");
const { parseTypeDefs } = require("../util/index.js");
const RESTRICTED_NAMES = require("../constants/restricted-names.js");
const IdioError = require("./idio-error.js");

const sleep = util.promisify(setTimeout);

/**
 * @typedef {Object} IdioEnum
 * @property {string} name - The Enum name.
 * @property {Promise<string>} typeDefs - Graphql typeDefs resolver.
 * @property {Object} resolver - The Enum resolver.
 */

/**
 * Creates a instance of IdioEnum. You can use IdioEnum to modularize an enum ( EnumTypeDefinition ),
 * together with its resolver. You can specify enums 'top-level' at combineNodes or at GraphQLNode level.
 *
 * @param {Object} config
 * @param {string} config.name - The Enum name.
 * @param {any} config.typeDefs - Graphql typeDefs, use filePath, string, or gql-tag.
 * @param {Object} config.resolver - The Enum resolver.
 *
 * @returns IdioEnum
 */
function IdioEnum({ name, typeDefs, resolver } = {}) {
    const prefix = "constructing IdioEnum";

    this.name;
    this.typeDefs;
    this.resolver;

    if (!name) {
        throw new IdioError(`${prefix} name required.`);
    }

    if (typeof name !== "string") {
        throw new IdioError(`${prefix} name must be of type 'string'.`);
    }

    if (RESTRICTED_NAMES[name.toLowerCase()]) {
        throw new IdioError(`${prefix}: '${name}' with invalid name.`);
    }

    this.name = name;

    if (!typeDefs) {
        throw new IdioError(`${prefix}: '${name}' typeDefs required.`);
    }

    try {
        this.typeDefs = parseTypeDefs(typeDefs);
    } catch (error) {
        throw new IdioError(`${prefix}: '${name}' \n${error}.`);
    }

    if (!resolver) {
        throw new IdioError(`${prefix}: '${name}' without a resolver.`);
    }

    this.resolver = resolver;
}

async function serve(brokerOptions) {
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

IdioEnum.prototype.serve = serve;

module.exports = IdioEnum;
