var _ = require('lodash');

var props = require('../resources/properties');
var outputFilters = require('../resources/output_filters');

var AlexaSkill = require('../vendor/AlexaSkill');
var utils = require('./utils');
var WmataApi = require('./api-wmata');

var APP_ID = process.env.APPLICATION_ID;

var MetroTransit = function () {
  AlexaSkill.call(this, APP_ID);
};

MetroTransit.prototype = Object.create(AlexaSkill.prototype);
MetroTransit.prototype.constructor = MetroTransit;

MetroTransit.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
  console.log('MetroTransit onSessionStarted requestId: ' + sessionStartedRequest.requestId +
      ', sessionId: ' + session.sessionId);
  // any initialization logic goes here
};

MetroTransit.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
  console.log('MetroTransit onLaunch requestId: ' + launchRequest.requestId + ', sessionId: ' + session.sessionId);
  response.ask(props.launchSpeechOutput, props.launchRepromptOutput);
};

MetroTransit.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
  console.log('MetroTransit onSessionEnded requestId: ' + sessionEndedRequest.requestId +
      ', sessionId: ' + session.sessionId);
  // any cleanup logic goes here
};

MetroTransit.prototype.intentHandlers = {
  GetHelp: function (intent, session, response) {
    response.tellWithCard(props.helpSpeechOutput, props.helpCardTitle, props.helpCardText);
  },

  GetStation: function (intent, session, response) {
    console.info('Requested Station Name: ' + intent.slots.station.value);
    var stationName = utils.changeStationName(intent.slots.station.value, 'correction');
    console.info('Corrected Station Name: ' + stationName);
    var station = utils.findStationByName(stationName);

    if (_.isNil(station)) {
      console.error(props.stationNotFoundConsole + ' ' + stationName + '.');
      var notFoundText = props.stationNotFoundSpeechOutput + ' "' + stationName + '".';
      response.tellWithCard(notFoundText, props.stationNotFoundTitle, notFoundText);
    } else {
      var stationCode = station.Code;
      var endpoint = props.stationArrivalWmataUrl + stationCode;

      WmataApi.get(endpoint, function (body) {
        var trainArrivals = _.reduce(body.Trains, function (result, train) {
          if (train.DestinationName === 'Train' || train.DestinationName === 'No Passenger') return result;

          var arrivals = result[train.DestinationName] || [];
          arrivals.push(train.Min);
          result[utils.changeStationName(train.DestinationName, 'abbreviation').toLowerCase()] = arrivals;
          return result;
        }, {});

        console.info('Train Arrivals', trainArrivals);
        var resp = utils.makeGetStationResponse(trainArrivals, station);
        // if there's > 1 train arriving we need to ask the user which destination they want to go to. otherwise we
        // don't need any more info from the user; we can just tell them when that train is coming or that no trains
        // are coming.
        if (_.size(trainArrivals) > 1) {
          session.attributes = trainArrivals;
          response.ask(resp.text, resp.text);
        } else {
          response.tellWithCard(resp.text, resp.title, resp.text);
        }
      }, function (error) {
        console.error(endpoint.concat(': Error with WMATA'), error);
        response.tellWithCard(props.wmataErrorSpeechOutput, props.wmataErrorTitle, props.wmataErrorSpeechOutput);
      });
    }
  },

  GetDestinationStation: function (intent, session, response) {
    var sessionAttributes = session.attributes;
    var destinationStationName = intent.slots.destinationStation.value;
    console.info('Station Name: ' + destinationStationName);

    if (_.has(sessionAttributes, destinationStationName)) {
      var arrivalTimes = sessionAttributes[destinationStationName];
      var resp = utils.makeGetDestinationResponse(arrivalTimes, destinationStationName);
      response.tellWithCard(resp.text, resp.title, resp.text);
    } else {
      var speechOutput = props.stationNotFoundSpeechOutput + ' ' + destinationStationName + '.';
      console.error(props.stationNotFoundConsole + ' ' + destinationStationName + '.');
      response.tellWithCard(speechOutput, props.stationNotFoundTitle, speechOutput);
    }
  },

  GetServiceAdvisories: function (intent, session, response) {
    WmataApi.get(props.serviceAdvisoriesWmataUrl, function (body) {
      var incidents = body.Incidents;
      console.info('Incidents: ' + JSON.stringify(incidents));
      if (_.size(incidents) === 0) {
        response.tellWithCard(props.noServiceAdvisoriesText, props.noServiceAdvisoriesTitle, props.noServiceAdvisoriesText);
        return;
      }
      var incidentList = _.map(incidents, 'Description');
      var advisoriesText = utils.replaceAbbreviations(incidentList.join('\n'), outputFilters['advisories']);
      response.tellWithCard(advisoriesText, props.stationAdvisoriesTitle, advisoriesText);
    }, function (error) {
      console.error(props.serviceAdvisoriesWmataUrl.concat(': Error with WMATA'), error);
      response.tell(props.wmataErrorSpeechOutput, props.wmataErrorTitle, props.wmataErrorSpeechOutput);
    });
  }
};

module.exports = new MetroTransit();
