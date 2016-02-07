'use strict';

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

  let things = [
    'this',
    'that',
    'other'
  ];
  let thing = [
    'this'
  ];

  t.equal(utils.joinListConjuction(things, ', ', ' or '), 'this, that or other');
  t.equal(utils.joinListConjuction(things, ', ', ' and '), 'this, that and other');
  t.equal(utils.joinListConjuction(thing, ', ', ' and '), 'this');
});
