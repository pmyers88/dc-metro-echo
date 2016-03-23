var _ = require('lodash');

var props = require('../resources/properties');
var stations = require('../resources/stations');

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
    var stationName = utils.changeStationName(intent.slots.station.value, 'correction');
    console.info('Station Name: ' + stationName);

    if (_.has(stations, stationName)) {
      var stationCode = stations[stationName].Code;
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
        if (_.size(trainArrivals) === 0) {
          response.tell(props.stationNoArrivalsSpeechOutput);
        } else {
          var destinationNeededText = 'Are you going to ' + utils.joinListConjuction(_.keys(trainArrivals), ', ', ' or ');
          session.attributes = trainArrivals;
          response.ask(destinationNeededText, destinationNeededText);
        }
      }, function (error) {
        console.error(endpoint.concat(': Error with WMATA'), error);
        response.tell(props.wmataErrorSpeechOutput);
      });
    }
  },

  GetDestinationStation: function (intent, session, response) {
    var sessionAttributes = session.attributes;
    var destinationStationName = intent.slots.destinationStation.value;
    console.info('Station Name: ' + destinationStationName);

    if (_.has(sessionAttributes, destinationStationName)) {
      var arrivalTimes = sessionAttributes[destinationStationName];
      var respText = 'The next ' + (arrivalTimes.length === 1
        ? 'train' : arrivalTimes.length + ' trains') + ' heading to ' + destinationStationName +
        (arrivalTimes.length === 1 ? ' arrives' : ' arrive') + ' in ' + utils.joinListConjuction(arrivalTimes, ', ', ' and ') + ' minutes.';
      response.tell(respText);
    } else {
      console.error(props.destinationNotFoundConsole + ' ' + destinationStationName);
      response.tell(props.destinationNotFoundSpeechOutput + ' ' + destinationStationName + '.');
    }
  },

  GetServiceAdvisories: function (intent, session, response) {
    WmataApi.get(props.serviceAdvisoriesWmataUrl, function (body) {
      var incidents = body.Incidents;
      if (!incidents) {
        console.error(props.serviceAdvisoriesErrorConsole);
        response.tell(props.serviceAdvisoriesErrorSpeechOutput);
        return;
      }
      var incidentList = _.map(incidents, 'Description');
      response.tell(incidentList.join('\n'));
    }, function (error) {
      console.error(props.serviceAdvisoriesWmataUrl.concat(': Error with WMATA'), error);
      response.tell(props.wmataErrorSpeechOutput);
    });
  }
};

module.exports = new MetroTransit();
