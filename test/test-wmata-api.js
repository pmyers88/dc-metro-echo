require('dotenv').config();
var path = require('path');
var tape = require('tape-expect');
var tapeNock = require('tape-nock');
var wmataApi = require('../lib/api-wmata.js');
var props = require('../resources/properties.json');

var test = tapeNock(tape, {
  fixtures: path.join(__dirname, 'fixtures')
});

test('wmata api get valid key', function (t) {
  var url = props.stationArrivalWmataUrl + 'B02?api_key=' + process.env.WMATA_API_KEY;
  wmataApi.get(url, function (response) {
    t.plan(2);
    t.ok(response);
    t.expect(response.Trains[0]).to.have.keys('Car', 'Destination', 'DestinationCode', 'DestinationName', 'Group', 'Line', 'LocationCode', 'LocationName', 'Min');
    t.end();
  });
});

test('wmata api get invalid key', function (t) {
  var url = props.stationArrivalWmataUrl + 'FooBar?api_key=' + process.env.WMATA_API_KEY;
  wmataApi.get(url, function (response) {}, function (error) {
    t.plan(2);
    t.expect(error.statusCode).to.be(400);
    t.expect(JSON.parse(error.body).Message).to.be('Station Code(s) not specified, invalid, or does not exist.');
    t.end();
  });
});
