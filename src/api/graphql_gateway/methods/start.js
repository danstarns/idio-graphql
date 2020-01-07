const util = require("util");
const combineNodes = require("../../combine_nodes/combine-nodes.js");
const GraphQLNode = require("../../graphql_node/graphql-node.js");
const IdioError = require("../../idio-error.js");

const sleep = util.promisify(setTimeout);

const createLocalNode = require("./create-local-node.js");

async function start() {
    const introspectionCall = async (service) => {
        let introspection;

        try {
            introspection = await this.broker.call(`${service}.introspection`, {
                gateway: this.broker.nodeID
            });
        } catch (error) {
            return;
        }

        if (
            this.REGISTERED_SERVICES.map((x) => x.name).includes(
                introspection.name
            )
        ) {
            throw new IdioError(
                `Gateway: '${this.broker.nodeID}' already has a registered service called: '${introspection.name}'`
            );
        }

        if (this.appliances.dependencies.includes(introspection.name)) {
            this.WAITING_SERVICES = this.WAITING_SERVICES.filter(
                (x) => x !== introspection.name
            );
        }

        if (this.appliances.nodes) {
            this.appliances.nodes.forEach((node) => {
                if (node.name === introspection.name) {
                    throw new IdioError(
                        `Gateway receiving a introspection request from node: '${introspection}' that is registered as a local node.`
                    );
                }
            });
        }

        this.REGISTERED_SERVICES.push(introspection);
    };

    this.broker.createService({
        name: this.broker.nodeID,
        events: {
            "introspection.request": async (payload, service) => {
                if (!this.started) {
                    await introspectionCall(service);
                }
            }
        }
    });

    await this.broker.start();

    const checkForServices = async (resolve, reject) => {
        if (this.WAITING_SERVICES.length) {
            this.broker.logger.info(
                `Waiting for services: [ ${this.WAITING_SERVICES.join(", ")} ]`
            );

            await sleep(2000);

            await Promise.all(
                this.WAITING_SERVICES.map(introspectionCall.bind(this))
            );

            return setImmediate(checkForServices, resolve, reject);
        }

        return resolve();
    };

    await new Promise(checkForServices);

    let nodes = this.REGISTERED_SERVICES.map(
        createLocalNode({ broker: this.broker, GraphQLNode })
    );

    if (this.appliances.nodes) {
        nodes = [...nodes, ...this.appliances.nodes];
    }

    const result = await combineNodes(nodes, { ...this.appliances });

    this.started = true;

    return { ...result, broker: this.broker };
}

module.exports = start;
