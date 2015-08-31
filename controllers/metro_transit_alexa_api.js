var request = require('request');
var _ = require('lodash');

var stations = require('../resources/stations');
var utils = require('../helpers/utils');
var alexa= require('../helpers/alexa');
var AlexaRouter = alexa.AlexaRouter;
var alexaRouter = new AlexaRouter();
var buildResponse = alexa.buildResponse;

var wmataReq = request.defaults({
  baseUrl: 'https://api.wmata.com',
  qs: { api_key: process.env.WMATA_API_KEY }
});

alexaRouter.onLaunchRequest = function(req, res) {
  res.json(buildResponse('DC Metro Echo', 'Metro App', 'Welcome to the DC Metro App! How can I help you?', false));
};

alexaRouter.onIntentRequest.onGetStation = function(req, res) {
  var intent = req.body.request.intent;
  var stationName = utils.changeStationName(intent.slots.station.value, 'correction');
  console.info('Station Name: ' + stationName);
  if (_.has(stations, stationName)) {
    var stationCode = stations[stationName].Code;
    wmataReq('/StationPrediction.svc/json/GetPrediction/' + stationCode, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var trainArrivals = _.reduce(JSON.parse(body).Trains, function(result, train) {
          if (train.DestinationName === 'Train' || train.DestinationName == 'No Passenger') return result;
          var arrivals = result[train.DestinationName] || [];
          arrivals.push(train.Min);
          result[utils.changeStationName(train.DestinationName, 'abbreviation').toLowerCase()] = arrivals;
          return result;
        }, {});
        console.info('Train Arrivals', trainArrivals);
        if (_.size(trainArrivals) === 0) {
          res.json(buildResponse('Sorry', 'Sorry', 'Sorry, there are no trains running at this time.', true));
        } else {
          var destinationNeededText = 'Are you going to ' + utils.joinListConjuction(_.keys(trainArrivals), ', ', ' or ');
          res.json(buildResponse('Destination Needed', '', destinationNeededText, false, trainArrivals));
        }
      }
    });
  }
};

alexaRouter.onIntentRequest.onGetDestinationStation = function(req, res) {
  var intent = req.body.request.intent;
  var sessionAttributes = req.body.session.attributes;
  var destinationStationName = intent.slots.destinationStation.value;
  console.info('Station Name: ' + destinationStationName);
  if (_.has(sessionAttributes, destinationStationName)) {
    var arrivalTimes = sessionAttributes[destinationStationName];
    var respText = 'The next ' + (arrivalTimes.length === 1 ?
      'train' : arrivalTimes.length + ' trains') + ' heading to ' + destinationStationName +
      (arrivalTimes.length === 1 ? ' arrives' : ' arrive') + ' in ' + utils.joinListConjuction(arrivalTimes, ', ', ' and ') + ' minutes.';
    res.json(buildResponse('Arrival Times', 'Here are the arrival times for trains heading to ' + destinationStationName + '.', respText, true));
  } else {
    console.error('Could not find destination station name: ' + destinationStationName);
    res.json(buildResponse('Destination Station Not Found', '', 'Sorry, I couldn\'t find the destination station ' + destinationStationName + '.', true));
  }
};

alexaRouter.onSessionEndedRequest = function(req, res) {
  res.json(buildResponse('Thank You', '', 'Thank you for using DC Metro App. Have a nice day.', true));
};

module.exports = alexaRouter.handleRequest;
