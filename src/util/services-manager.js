const util = require("util");

const sleep = util.promisify(setImmediate);

function _getNextService() {
    if (!this.activeServices.length) {
        return null;
    }

    let found;

    if (this.activeServices.length === 1) {
        [found] = this.activeServices;

        this.lastOutput = found;

        return found;
    }

    if (this.activeServices.length === 2) {
        if (this.lastOutput !== this.activeServices[0]) {
            this.lastOutput = this.activeServices[0];

            return this.activeServices[0];
        }

        this.lastOutput = this.activeServices[1];

        return this.activeServices[1];
    }

    found = this.activeServices[
        Math.floor(Math.random() * this.activeServices.length)
    ];

    if (found === this.lastOutput) {
        return _getNextService.call(this);
    }

    this.lastOutput = found;

    return found;
}

/**
 * @typedef ServiceManager
 * @property {string} gateway
 * @property {string} serviceName
 * @property {string} hash
 * @property {string[]} activeServices
 * @property {string} lastOutput
 */

/**
 * @returns {ServiceManager}
 */
function ServiceManager(service, { broker, hash }) {
    const [serviceName, gateway] = service.split(":");

    this.gateway = gateway;
    this.serviceName = serviceName;
    this.hash = hash;
    this.activeServices = [service];
    this.lastOutput;

    setInterval(async () => {
        this.activeServices = (
            await broker.call("$node.list", { onlyAvailable: true })
        )
            .filter((_service) => {
                const [_serviceName, _gateway] = _service.id.split(":");

                return _serviceName === serviceName && _gateway === gateway;
            })
            .map(({ id }) => id);
    }, broker.options.heartbeatInterval * 1000);
}

ServiceManager.prototype.push = function push(service) {
    this.activeServices = [...new Set([...this.activeServices, service])];
};

ServiceManager.prototype.getNextService = async function getNextService() {
    let counter = 0;

    async function getServiceToCall() {
        counter += 1;

        await sleep();

        const service = _getNextService.call(this);

        if (service) {
            return service;
        }

        if (counter > 10) {
            if (!service && this.lastOutput) {
                return this.lastOutput;
            }

            return service;
        }

        if (!service) {
            await sleep();

            return getServiceToCall.call(this);
        }
    }

    const serviceToCall = await getServiceToCall.call(this);

    return serviceToCall;
};

module.exports = ServiceManager;
