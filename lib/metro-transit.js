var AlexaSkill = require('../vendor/AlexaSkill');

var eventHandlers = require('./event-handlers');
var intentHandlers = require('./intent-handlers');

var APP_ID = process.env.APPLICATION_ID;

var MetroTransit = function () {
  AlexaSkill.call(this, APP_ID);
};

MetroTransit.prototype = Object.create(AlexaSkill.prototype);
MetroTransit.prototype.constructor = MetroTransit;

eventHandlers.register(MetroTransit.prototype.eventHandlers);
intentHandlers.register(MetroTransit.prototype.intentHandlers);

module.exports = new MetroTransit();
