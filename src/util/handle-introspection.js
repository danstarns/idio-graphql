const ServicesManager = require("./services-manager.js");

module.exports = (RUNTIME) => {
    return function handleIntrospection({ params: { gateway, hash } }) {
        const [serviceName] = gateway.split(":");

        if (!RUNTIME.gatewayManagers[serviceName]) {
            RUNTIME.gatewayManagers[serviceName] = new ServicesManager(
                gateway,
                {
                    broker: RUNTIME.broker,
                    hash
                }
            );
        } else {
            RUNTIME.gatewayManagers[serviceName].push(gateway);
        }

        if (serviceName === RUNTIME.brokerOptions.gateway) {
            RUNTIME.initialized = true;
        }

        return RUNTIME.introspection;
    };
};
