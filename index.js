var _ = require('lodash');
var request = require('request');

var secrets = require('./secret/secrets');
var stations = require('./resources/stations');
var utils = require('./lib/utils');

var APP_ID = secrets.applicationId;
var AlexaSkill = require('./lib/AlexaSkill');

var wmataReq = request.defaults({
  baseUrl: 'https://api.wmata.com',
  qs: secrets.apiKey
});

var getWmataResponse = function(endpoint, response, callback) {
  wmataReq(endpoint, function(error, res, body) {
    if (!error && res.statusCode === 200) {
      callback(JSON.parse(body));
    } else {
      response.tell('There was an error making the WMATA request, please try again later.');
    }
  });
};

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
  var speechOutput = 'Welcome to the DC Metro App! How can I help you?';
  var repromptText = 'How can I help you?';
  response.ask(speechOutput, repromptText);
};

MetroTransit.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
  console.log('MetroTransit onSessionEnded requestId: ' + sessionEndedRequest.requestId +
      ', sessionId: ' + session.sessionId);
  // any cleanup logic goes here
};

MetroTransit.prototype.intentHandlers = {

  GetStation: function (intent, session, response) {
    var stationName = utils.changeStationName(intent.slots.station.value, 'correction');
    console.info('Station Name: ' + stationName);

    if (_.has(stations, stationName)) {
      var stationCode = stations[stationName].Code;

      getWmataResponse('/StationPrediction.svc/json/GetPrediction/' + stationCode, response, function(body) {
        var trainArrivals = _.reduce(body.Trains, function(result, train) {
          if (train.DestinationName === 'Train' || train.DestinationName == 'No Passenger') return result;

          var arrivals = result[train.DestinationName] || [];
          arrivals.push(train.Min);
          result[utils.changeStationName(train.DestinationName, 'abbreviation').toLowerCase()] = arrivals;
          return result;
        }, {});

        console.info('Train Arrivals', trainArrivals);
        if (_.size(trainArrivals) === 0) {
          response.tell('Sorry, there are no trains running at this time.');
        } else {
          var destinationNeededText = 'Are you going to ' + utils.joinListConjuction(_.keys(trainArrivals), ', ', ' or ');
          response.ask(destinationNeededText, destinationNeededText);
        }
      });
    }
  },

  GetDestinationStation: function (intent, session, response) {
    var sessionAttributes = session.attributes;
    var destinationStationName = intent.slots.destinationStation.value;
    console.info('Station Name: ' + destinationStationName);

    if (_.has(sessionAttributes, destinationStationName)) {
      var arrivalTimes = sessionAttributes[destinationStationName];
      var respText = 'The next ' + (arrivalTimes.length === 1 ?
        'train' : arrivalTimes.length + ' trains') + ' heading to ' + destinationStationName +
        (arrivalTimes.length === 1 ? ' arrives' : ' arrive') + ' in ' + utils.joinListConjuction(arrivalTimes, ', ', ' and ') + ' minutes.';
      response.tell(respText);
    } else {
      console.error('Could not find destination station name: ' + destinationStationName);
      response.tell('Sorry, I couldn\'t find the destination station ' + destinationStationName + '.');
    }
  }
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the MetroTransit skill.
    var helloWorld = new MetroTransit();
    helloWorld.execute(event, context);
};

