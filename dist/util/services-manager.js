"use strict";

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.promise");

const util = require("util");

const sleep = util.promisify(setTimeout);
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

function ServiceManager(service, {
  broker,
  hash
}) {
  const [serviceName, gateway] = service.split(":");
  this.gateway = gateway;
  this.serviceName = serviceName;
  this.hash = hash;
  this.activeServices = [service];
  this.lastOutput;
  setInterval(async () => {
    this.activeServices = (await broker.call("$node.list", {
      onlyAvailable: true
    })).filter(_service => {
      const [_serviceName, _gateway] = _service.id.split(":");

      return _serviceName === serviceName && _gateway === gateway;
    }).map(({
      id
    }) => id);
  }, broker.options.heartbeatInterval * 1000);
}

ServiceManager.prototype.push = function push(service) {
  this.activeServices = [...new Set([...this.activeServices, service])];
};

ServiceManager.prototype.getNextService = async function getNextService() {
  let counter = 0;

  async function getServiceToCall() {
    counter += 1;

    if (!this.activeServices.length) {
      return;
    }

    const service = this.activeServices[Math.floor(Math.random() * this.activeServices.length)];

    if (service === this.lastOutput) {
      if (counter > 10) {
        return service;
      }

      await sleep(100);
      return getServiceToCall.call(this);
    }

    this.lastOutput = service;
    return service;
  }

  const serviceToCall = await getServiceToCall.call(this);
  return serviceToCall;
};

module.exports = ServiceManager;