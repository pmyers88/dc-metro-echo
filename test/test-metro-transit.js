const test = require('tape');
const MetroTransit = require('../lib/metro-transit.js');

test('MetroTransit eventHandlers has the right methods', (t) => {
  t.plan(4);

  t.equal(typeof MetroTransit.eventHandlers.onIntent, 'function', 'onIntent method exists');
  t.equal(typeof MetroTransit.eventHandlers.onLaunch, 'function', 'onLaunch method exists');
  t.equal(typeof MetroTransit.eventHandlers.onSessionEnded, 'function', 'onSessionEnded method exists');
  t.equal(typeof MetroTransit.eventHandlers.onSessionStarted, 'function', 'onSessionStarted method exists');
});

test('MetroTransit intentHandlers has the right methods', (t) => {
  t.plan(8);

  t.equal(typeof MetroTransit.intentHandlers['AMAZON.HelpIntent'], 'function', 'AMAZON.HelpIntent method exists');
  t.equal(typeof MetroTransit.intentHandlers['AMAZON.CancelIntent'], 'function', 'AMAZON.CancelIntent method exists');
  t.equal(typeof MetroTransit.intentHandlers['AMAZON.StopIntent'], 'function', 'AMAZON.StopIntent method exists');
  t.equal(typeof MetroTransit.intentHandlers.SetHome, 'function', 'SetHome method exists');
  t.equal(typeof MetroTransit.intentHandlers.GetTrainsAt, 'function', 'GetTrainsAt method exists');
  t.equal(typeof MetroTransit.intentHandlers.GetTrainsAtHome, 'function', 'GetTrainsAtHome method exists');
  t.equal(typeof MetroTransit.intentHandlers.GetDestinationStation, 'function', 'GetDestinationStation method exists');
  t.equal(typeof MetroTransit.intentHandlers.GetServiceAdvisories, 'function', 'GetServiceAdvisories method exists');
});
