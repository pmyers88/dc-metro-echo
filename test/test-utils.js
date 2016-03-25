var test = require('tape');
var utils = require('../lib/utils');
var abbreviations = require('../resources/abbreviations');

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

test('joinListConjunction test', function (t) {
  t.plan(3);

  var things = [
    'this',
    'that',
    'other'
  ];
  var thing = [
    'this'
  ];

  t.equal(utils.joinListConjunction(things, ', ', ' or '), 'this, that or other');
  t.equal(utils.joinListConjunction(things, ', ', ' and '), 'this, that and other');
  t.equal(utils.joinListConjunction(thing, ', ', ' and '), 'this');
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

test('test makeGetDestinationResponseText for zero, single or multiple stations', function (t) {
  t.plan(6);
  var multIntArrivals = ['4', '8'];
  var singleIntArrival = ['5'];
  var singleBrdSingleIntArrivals = ['BRD', '6'];
  var singleBrdMultIntArrivals = ['BRD', '6', '8'];
  var multBrdSingleIntArrivals = ['BRD', 'ARR', '6'];
  var singleBrdArrival = ['BRD'];

  var stationName = 'ballston';

  t.equal(utils.makeGetDestinationResponseText(multIntArrivals, stationName), 'The next 2 trains to ballston arrive ' +
    'in 4 and 8 minutes.');
  t.equal(utils.makeGetDestinationResponseText(singleIntArrival, stationName), 'The next train to ballston arrives ' +
    'in 5 minutes.');
  t.equal(utils.makeGetDestinationResponseText(singleBrdSingleIntArrivals, stationName), 'The next train to ballston is ' +
    'boarding now. There is also a train arriving in 6 minutes.');
  t.equal(utils.makeGetDestinationResponseText(singleBrdMultIntArrivals, stationName), 'The next train to ballston is ' +
    'boarding now. There are also trains arriving in 6 and 8 minutes.');
  t.equal(utils.makeGetDestinationResponseText(multBrdSingleIntArrivals, stationName), 'The next train to ballston is ' +
    'boarding now. There is also a train arriving in 6 minutes.');
  t.equal(utils.makeGetDestinationResponseText(singleBrdArrival, stationName), 'The next train to ballston is ' +
    'boarding now.');
});

test('test sanitizeServiceAdvisories replaces known abbreviations with words', function (t) {
  t.plan(2);
  var serviceAdvisoryText = 'Blu/Org Line: Single tracking btwn Stadium-Armory & Eastern Market due to scheduled ' +
    'track work. Expect delays through tonight\'s closing. Silver Line: Trains operating btwn Wiehle-Reston & ' +
    'Ballston only due to scheduled track work. Use Orange/Blue Lines to/from other stations.';
  t.equal(utils.replaceAbbreviations(serviceAdvisoryText, abbreviations['advisories']), 'Blue/Orange Line: Single tracking between ' +
    'Stadium-Armory & Eastern Market due to scheduled track work. Expect delays through tonight\'s closing. Silver ' +
      'Line: Trains operating between Wiehle-Reston & Ballston only due to scheduled track work. Use Orange/Blue ' +
      'Lines to/from other stations.');
  var arrivalsText = 'The next train to vienna is BRD now.';
  t.equal(utils.replaceAbbreviations(arrivalsText, abbreviations['arrivals']), 'The next train to vienna is boarding now.');
});
