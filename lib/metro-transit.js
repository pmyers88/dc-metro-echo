'use strict';
const AlexaSkill = require('../vendor/AlexaSkill');

const eventHandlers = require('./event-handlers');
const intentHandlers = require('./intent-handlers');

const APP_ID = process.env.APPLICATION_ID;

let MetroTransit = function () {
  AlexaSkill.call(this, APP_ID);
};

MetroTransit.prototype = Object.create(AlexaSkill.prototype);
MetroTransit.prototype.constructor = MetroTransit;

eventHandlers.register(MetroTransit.prototype.eventHandlers);
intentHandlers.register(MetroTransit.prototype.intentHandlers);

module.exports = new MetroTransit();
