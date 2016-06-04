var test = require('tape');
var MetroTransit = require('../lib/metro-transit.js');

test('MetroTransit eventHandlers has the right methods', function (t) {
  t.plan(4);

  t.equal(typeof MetroTransit.eventHandlers.onIntent, 'function', 'onIntent method exists');
  t.equal(typeof MetroTransit.eventHandlers.onLaunch, 'function', 'onLaunch method exists');
  t.equal(typeof MetroTransit.eventHandlers.onSessionEnded, 'function', 'onSessionEnded method exists');
  t.equal(typeof MetroTransit.eventHandlers.onSessionStarted, 'function', 'onSessionStarted method exists');
});

test('MetroTransit intentHandlers has the right methods', function (t) {
  t.plan(4);

  t.equal(typeof MetroTransit.intentHandlers['AMAZON.HelpIntent'], 'function', 'AMAZON.HelpIntent method exists');
  t.equal(typeof MetroTransit.intentHandlers.GetStation, 'function', 'GetStation method exists');
  t.equal(typeof MetroTransit.intentHandlers.GetDestinationStation, 'function', 'GetDestinationStation method exists');
  t.equal(typeof MetroTransit.intentHandlers.GetServiceAdvisories, 'function', 'GetServiceAdvisories method exists');
});
