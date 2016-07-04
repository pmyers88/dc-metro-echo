'use strict';
require('dotenv').config();
const MetroTransit = require('./lib/metro-transit');

// Create the handler that responds to the Alexa Request.
exports.handler = (event, context) => {
  MetroTransit.execute(event, context);
};
