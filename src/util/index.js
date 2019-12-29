const parseTypeDefs = require("./parse-typedefs.js");
const isFunction = require("./is-function.js");
const checkInstance = require("./check-instance.js");
const wrappedResolver = require("./wrapped-resolver.js");

module.exports = {
    parseTypeDefs,
    isFunction,
    checkInstance,
    wrappedResolver
};
