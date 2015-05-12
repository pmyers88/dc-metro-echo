var express = require('express');
var router = express.Router();
var request = require('request');
var _ = require('lodash');

var stations = require('../resources/stations');
var utils = require('../helpers/utils');

var wmataReq = request.defaults({
  baseUrl: 'https://api.wmata.com',
  qs: { api_key: process.env.WMATA_API_KEY }
});

var buildResponse = function(title, subtitle, content, shouldEndSession, sessionAttributes) {
  var response = {
    version: '1.0',
    response: {
      outputSpeech: {
        type: 'PlainText',
        text: content
      },
      card: {
        type: 'Simple',
        title: title,
        subtitle: subtitle,
        content: content
      },
      shouldEndSession: shouldEndSession
    }
  };
  if (!utils.isNullOrUndefined(sessionAttributes)) {
    _.extend(response, { sessionAttributes: sessionAttributes });
  }
  return response;
};

router.get('/', function(req, res) {
  res.send('Welcome to the DC Metro App api!!!');
});

router.post('/', function(req, res) {
  console.info('Request Body: ', req.body);
  var reqType = req.body.request.type;
  if (reqType === 'LaunchRequest') {
    res.json(buildResponse('DC Metro Echo', 'Metro App', 'Welcome to the DC Metro App! How can I help you?', false));
  } else if (reqType === 'IntentRequest') {
    var intent = req.body.request.intent;
    var sessionAttributes = req.body.session.attributes;
    if (intent.name === 'GetStation') {
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
      } else {
        console.error('Could not find station name: ' + stationName);
        res.json(buildResponse('Sorry', 'Sorry', 'Sorry, I couldn\'t find the station ' + stationName, true));
      }
    } else if (intent.name === 'GetDestinationStation') {
      var stationName = intent.slots.destinationStation.value;
      console.info('Station Name: ' + stationName);
      if (_.has(sessionAttributes, stationName)) {
        var arrivalTimes = sessionAttributes[stationName];
        var respText = 'The next ' + (arrivalTimes.length === 1 ?
          'train' : arrivalTimes.length + ' trains') + ' heading to ' + stationName +
          (arrivalTimes.length === 1 ? ' arrives' : 'arrive') + ' in ' + utils.joinListConjuction(arrivalTimes, ', ', ' and ') + ' minutes.';
        res.json(buildResponse('Arrival Times', 'Here are the arrival times for trains heading to ' + stationName + '.', respText, true));
      } else {
        console.error('Could not find destination station name: ' + stationName);
        res.json(buildResponse('Destination Station Not Found', '', 'Sorry, I couldn\'t find the destination station ' + stationName + '.', true));
      }
    } else {
      console.error('Invalid Request: ' + intent.name);
      res.json(buildResponse('Invalid Request', '', intent.name + ' is not a valid intent type.', true));
    }
  } else if (reqType === 'SessionEndedRequest') {
    res.json(buildResponse('Thank You', '', 'Thank you for using DC Metro App. Have a nice day.', true));
  } else {
    console.error('Unknown Error', req);
    res.json(buildResponse('Invalid Request Type', 'Invalid Request Type', 'Something went wrong, your request was invalid', true));
  }
});

module.exports = router;
