"use strict";

const loadAppliances = require("./load-appliances.js");

const createLocalAppliance = require("./create-local-appliance.js");

const serveAppliance = require("./serve-appliance.js");

module.exports = {
  loadAppliances,
  createLocalAppliance,
  serveAppliance
};