require('dotenv').config();
var path = require('path');
var tape = require('tape');
var tapeNock = require('tape-nock');
var wmataApi = require('../lib/api-wmata.js');
var props = require('../resources/properties.json');

var test = tapeNock(tape, {
  fixtures: path.join(__dirname, 'fixtures')
});

test('wmata api get', function (t) {
  var url = props.stationArrivalWmataUrl + 'A15?api_key=' + process.env.WMATA_API_KEY;
  wmataApi.get(url, function (response) {
    t.ok(response);
    t.end();
  }, function (error) {
    t.error(error);
    t.end();
  });
});
