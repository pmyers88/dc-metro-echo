'use strict';
const test = require('tape');
const utils = require('../lib/utils');
const outputFilters = require('../resources/output_filters');

test('test changeStationName with corrections', (t) => {
  t.plan(3);

  t.equal(utils.changeStationName('boston', 'correction'), 'Ballston-MU');
  t.equal(utils.changeStationName('ballston', 'correction'), 'Ballston-MU');
  t.equal(utils.changeStationName('not listed', 'correction'), 'not listed');
});

test('test changeStationName with outputFilters', (t) => {
  t.plan(3);

  t.equal(utils.changeStationName('Achives-Navy Memorial-Penn Quarter', 'abbreviation'), 'Archives');
  t.equal(utils.changeStationName('Wiehle Reston East', 'abbreviation'), 'Wiehle Reston East');
  t.equal(utils.changeStationName('not listed', 'abbreviation'), 'not listed');
});

test('joinListConjunction test', (t) => {
  t.plan(4);

  const things = [
    'this',
    'that',
    'other'
  ];
  const twoThings = [
    'this',
    'that'
  ];
  const thing = [
    'this'
  ];

  t.equal(utils.joinListConjunction(things, ', ', 'or'), 'this, that or other');
  t.equal(utils.joinListConjunction(things, ', ', 'and'), 'this, that and other');
  t.equal(utils.joinListConjunction(twoThings, ', ', 'or'), 'this or that');
  t.equal(utils.joinListConjunction(thing, ', ', 'and'), 'this');
});

test('test makeGetStationResponse for zero, single or multiple stations', (t) => {
  t.plan(6);
  const multipleStationArrivals = {
    'largo town center': ['4', '8'],
    'vienna': ['12', '16'],
    'wiehle reston east': ['9'],
    'new carrollton': ['2']
  };
  const oneStationArrival = {
    'vienna': ['7']
  };
  const stationName = 'ballston';

  let response = utils.makeGetStationResponse(multipleStationArrivals, stationName);
  t.equal(response.text, 'Are you traveling in the direction of Largo Town Center, Vienna, Wiehle Reston East or New Carrollton?');
  t.equal(response.title, '');
  response = utils.makeGetStationResponse(oneStationArrival, stationName);
  t.equal(response.text, 'The next train to Vienna arrives in 7 minutes. There are no other trains arriving at Ballston in the next 20 minutes.');
  t.equal(response.title, 'Arrivals for Ballston');
  response = utils.makeGetStationResponse({}, stationName);
  t.equal(response.text, 'Sorry, there are no trains arriving at Ballston in the next 20 minutes.');
  t.equal(response.title, 'No Trains Found');
});

test('test makeGetDestinationResponse for zero, single or multiple stations', (t) => {
  t.plan(12);
  const multIntArrivals = ['4', '8'];
  const singleIntArrival = ['5'];
  const singleBrdSingleIntArrivals = ['BRD', '6'];
  const singleBrdMultIntArrivals = ['BRD', '6', '8'];
  const multBrdSingleIntArrivals = ['BRD', 'ARR', '6'];
  const singleBrdArrival = ['BRD'];

  const stationName = 'ballston';

  let response = utils.makeGetDestinationResponse(multIntArrivals, stationName);
  t.equal(response.text, 'The next 2 trains to Ballston arrive in 4 and 8 minutes.');
  t.equal(response.title, 'Arrivals for Ballston');
  response = utils.makeGetDestinationResponse(singleIntArrival, stationName);
  t.equal(response.text, 'The next train to Ballston arrives in 5 minutes.');
  t.equal(response.title, 'Arrivals for Ballston');
  response = utils.makeGetDestinationResponse(singleBrdSingleIntArrivals, stationName);
  t.equal(response.text, 'The next train to Ballston is boarding now. Also, there is a train arriving in 6 minutes.');
  t.equal(response.title, 'Arrivals for Ballston');
  response = utils.makeGetDestinationResponse(singleBrdMultIntArrivals, stationName);
  t.equal(response.text, 'The next train to Ballston is boarding now. Also, there are trains arriving in 6 and 8 minutes.');
  t.equal(response.title, 'Arrivals for Ballston');
  response = utils.makeGetDestinationResponse(multBrdSingleIntArrivals, stationName);
  t.equal(response.text, 'The next train to Ballston is boarding now. Also, there is a train arriving in 6 minutes.');
  t.equal(response.title, 'Arrivals for Ballston');
  response = utils.makeGetDestinationResponse(singleBrdArrival, stationName);
  t.equal(response.text, 'The next train to Ballston is boarding now.');
  t.equal(response.title, 'Arrivals for Ballston');
});

test('test replaceAbbreviations replaces known outputFilters with words', (t) => {
  t.plan(2);
  const serviceAdvisoryText = 'Blu/Org Line: Single tracking btwn Stadium-Armory & Eastern Market due to scheduled ' +
    'track work. Expect delays through tonight\'s closing. Silver Line: Trains operating btwn Wiehle-Reston & ' +
    'Ballston only due to scheduled track work. Use Orange/Blue Lines to/from other stations.';
  t.equal(utils.replaceAbbreviations(serviceAdvisoryText, outputFilters['advisories']), 'Blue/Orange Line: Single tracking between ' +
    'Stadium-Armory & Eastern Market due to scheduled track work. Expect delays through tonight\'s closing. Silver ' +
      'Line: Trains operating between Wiehle-Reston & Ballston only due to scheduled track work. Use Orange/Blue ' +
      'Lines to/from other stations.');
  const arrivalsText = 'The next train to vienna is BRD now.';
  t.equal(utils.replaceAbbreviations(arrivalsText, outputFilters['arrivals']), 'The next train to vienna is boarding now.');
});

test('test findStationByName for stations that exist and don\'t exist', (t) => {
  t.plan(3);

  const waterfrontStation = {
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
  t.deepEqual(utils.findStationByName('waterfront'), waterfrontStation, 'Waterfront station is found by lowercase name');
  t.equal(typeof utils.findStationByName('not a real station name'), 'undefined', 'bad station name returns undefined');
});

test('test titleize function', (t) => {
  t.plan(5);
  t.equal(utils.titleize('silver spring'), 'Silver Spring', 'silver spring -> Silver Spring conversion works');
  t.equal(utils.titleize('takoma'), 'Takoma', 'takoma-> Takoma conversion works');
  t.equal(utils.titleize('Gallery Pl-Chinatown'), 'Gallery Pl-Chinatown', 'Gallery Pl-Chinatown string is not changed');
  t.equal(utils.titleize('NoMa-Gallaudet U'), 'NoMa-Gallaudet U', 'NoMa-Gallaudet U string is not changed');
  t.equal(utils.titleize('Foggy Bottom-GWU'), 'Foggy Bottom-GWU', 'Foggy Bottom-GWU string is not changed');
});
