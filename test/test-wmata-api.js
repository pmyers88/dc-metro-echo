require('dotenv').config();
var path = require('path');
var tape = require('tape-expect');
var tapeNock = require('tape-nock');
var wmataApi = require('../lib/api-wmata.js');
var props = require('../resources/properties.json');

var test = tapeNock(tape, {
  fixtures: path.join(__dirname, 'fixtures')
});

test('wmata api get station prediction valid key', function (t) {
  var url = props.stationArrivalWmataUrl + 'B02';
  wmataApi.get(url, function (response) {
    t.plan(2);
    t.ok(response);
    t.expect(response.Trains[0]).to.have.keys('Car', 'Destination', 'DestinationCode', 'DestinationName', 'Group',
      'Line', 'LocationCode', 'LocationName', 'Min');
    t.end();
  });
});

test('wmata api get station prediction invalid key', function (t) {
  var url = props.stationArrivalWmataUrl + 'FooBar';
  wmataApi.get(url, null, function (error) {
    t.plan(2);
    t.expect(error.statusCode).to.be(400);
    t.expect(JSON.parse(error.body).Message).to.be('Station Code(s) not specified, invalid, or does not exist.');
    t.end();
  });
});

test('wmata api get incidents', function (t) {
  wmataApi.get(props.serviceAdvisoriesWmataUrl, function (response) {
    t.plan(2);
    t.ok(response);
    t.expect(response.Incidents[0]).to.have.keys('IncidentID', 'Description', 'StartLocationFullName',
      'EndLocationFullName', 'PassengerDelay', 'DelaySeverity', 'IncidentType', 'EmergencyText', 'LinesAffected', 'DateUpdated');
    t.end();
  });
});
