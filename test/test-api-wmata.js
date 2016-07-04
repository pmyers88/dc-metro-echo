const path = require('path');
const tape = require('tape-expect');
const tapeNock = require('tape-nock');
const wmataApi = require('../lib/api-wmata.js');
const props = require('../resources/properties.json');

const test = tapeNock(tape, {
  fixtures: path.join(__dirname, 'fixtures')
});

test('wmata api get station prediction valid key', (t) => {
  const url = props.stationArrivalWmataUrl + 'A01?api_key=secret';
  wmataApi.get(url, (response) => {
    t.plan(2);
    t.ok(response);
    t.expect(response.Trains[0]).to.have.keys('Car', 'Destination', 'DestinationCode', 'DestinationName', 'Group',
      'Line', 'LocationCode', 'LocationName', 'Min');
    t.end();
  });
});

test('wmata api get station prediction invalid key', (t) => {
  const url = props.stationArrivalWmataUrl + 'FooBar?api_key=secret';
  wmataApi.get(url, null, (error) => {
    t.plan(2);
    t.expect(error.statusCode).to.be(400);
    t.expect(JSON.parse(error.body).Message).to.be('Station Code(s) not specified, invalid, or does not exist.');
    t.end();
  });
});

test('wmata api get incidents', (t) => {
  wmataApi.get(props.serviceAdvisoriesWmataUrl + '?api_key=secret', (response) => {
    t.plan(2);
    t.ok(response);
    t.expect(response.Incidents[0]).to.have.keys('IncidentID', 'Description', 'StartLocationFullName',
      'EndLocationFullName', 'PassengerDelay', 'DelaySeverity', 'IncidentType', 'EmergencyText', 'LinesAffected', 'DateUpdated');
    t.end();
  });
});
