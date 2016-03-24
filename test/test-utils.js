var test = require('tape');
var utils = require('../lib/utils');

test('test isNullOrUndefined logic', function (t) {
  t.plan(5);

  t.ok(utils.isNullOrUndefined(null));
  t.ok(utils.isNullOrUndefined(undefined));
  t.notOk(utils.isNullOrUndefined(3));
  t.notOk(utils.isNullOrUndefined('null'));
  t.notOk(utils.isNullOrUndefined('undefined'));
});

test('test changeStationName with corrections', function (t) {
  t.plan(3);

  t.equal(utils.changeStationName('boston', 'correction'), 'ballston');
  t.equal(utils.changeStationName('ballston', 'correction'), 'ballston');
  t.equal(utils.changeStationName('not listed', 'correction'), 'not listed');
});

test('test changeStationName with abbreviations', function (t) {
  t.plan(3);

  t.equal(utils.changeStationName('Achives-Navy Memorial-Penn Quarter', 'abbreviation'), 'Archives');
  t.equal(utils.changeStationName('Wiehle Reston East', 'abbreviation'), 'Wiehle Reston East');
  t.equal(utils.changeStationName('not listed', 'abbreviation'), 'not listed');
});

test('joinListConjuction test', function (t) {
  t.plan(3);

  var things = [
    'this',
    'that',
    'other'
  ];
  var thing = [
    'this'
  ];

  t.equal(utils.joinListConjuction(things, ', ', ' or '), 'this, that or other');
  t.equal(utils.joinListConjuction(things, ', ', ' and '), 'this, that and other');
  t.equal(utils.joinListConjuction(thing, ', ', ' and '), 'this');
});

test('test makeGetStationResponseText for zero, single or multiple stations', function (t) {
  t.plan(3);
  var multipleStationArrivals = {
    'largo town center': ['4', '8'],
    'vienna': ['12', '16'],
    'wiehle reston east': ['9'],
    'new carrollton': ['2']
  };
  var oneStationArrival = {
    'vienna': ['7']
  };
  var stationName = 'ballston';

  t.equal(utils.makeGetStationResponseText(multipleStationArrivals, stationName), 'Are you going to largo town ' +
    'center, vienna, wiehle reston east or new carrollton?');
  t.equal(utils.makeGetStationResponseText(oneStationArrival, stationName), 'The next train to vienna arrives in 7 ' +
    'minutes. There are no other trains arriving at ballston in the next 20 minutes.');
  t.equal(utils.makeGetStationResponseText({}, stationName), 'Sorry, there are no trains running at this time.');
});

test('test sanitizeServiceAdvisories replaces known abbreviations with words', function (t) {
  t.plan(1);
  var serviceAdvisoryText = 'Blu/Org Line: Single tracking btwn Stadium-Armory & Eastern Market due to scheduled ' +
    'track work. Expect delays through tonight\'s closing. Silver Line: Trains operating btwn Wiehle-Reston & ' +
    'Ballston only due to scheduled track work. Use Orange/Blue Lines to/from other stations.';
  t.equal(utils.sanitizeServiceAdvisories(serviceAdvisoryText), 'Blue/Orange Line: Single tracking between ' +
    'Stadium-Armory & Eastern Market due to scheduled track work. Expect delays through tonight\'s closing. Silver ' +
      'Line: Trains operating between Wiehle-Reston & Ballston only due to scheduled track work. Use Orange/Blue ' +
      'Lines to/from other stations.');
});

test('test findStationByName for stations that exist and don\'t exist', function (t) {
  t.plan(2);

  var waterfrontStation = {
    'Code': 'F04',
    'Name': 'Waterfront',
    'StationTogether1': '',
    'StationTogether2': '',
    'LineCode1': 'GR',
    'LineCode2': null,
    'LineCode3': null,
    'LineCode4': null,
    'Lat': 38.876221,
    'Lon': -77.017491,
    'Address': {
      'Street': '399 M Street SW',
      'City': 'Washington',
      'State': 'DC',
      'Zip': '20024'
    }
  };

  t.deepEqual(utils.findStationByName('Waterfront'), waterfrontStation, 'Waterfront station is found by name');
  t.equal(typeof utils.findStationByName('not a real station name'), 'undefined', 'bad station name returns undefined');
});
