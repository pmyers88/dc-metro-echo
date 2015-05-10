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
  var reqType = req.body.request.type;
  if (reqType === 'LaunchRequest') {
    res.json(buildResponse('DC Metro Echo', 'Metro App', 'Welcome to the DC Metro App! How can I help you?', false));
  } else if (reqType === 'IntentRequest') {
    var intent = req.body.request.intent;
    if (intent.name === 'GetStation') {
      var stationName = intent.slots.station.value;
      console.log('Station Name: ' + stationName);
      if (_.has(stations, stationName)) {
        var stationCode = stations[stationName].Code;
        wmataReq('/StationPrediction.svc/json/GetPrediction/' + stationCode, function(error, response, body) {
          if (!error && response.statusCode === 200) {
            var trainArrivals = _.reduce(JSON.parse(body).Trains, function(result, train) {
              if (train.DestinationName === 'Train') return '';
              var arrivals = result[train.DestinationName] || [];
              arrivals.push(train.Min);
              result[train.DestinationName] = arrivals;
              return result;
            }, {});
            var possibleDestinations = _.keys(trainArrivals);
            var destinationNeededText = 'Are you going to ' +
              possibleDestinations.slice(0, possibleDestinations.length - 1).join(', ') +
              (possibleDestinations.length > 1 ?
                ' or ' + _.last(possibleDestinations) + '?' :
                '');
            res.json(buildResponse('Destination Needed', '', destinationNeededText, false, trainArrivals));
          }
        });
      } else {
        res.json(buildResponse('Sorry', 'Sorry', 'Sorry, I couldn\'t find the station ' + stationName, true));
      }
    } else {
      res.json(buildResponse('Invalid Request', '', intent.name + ' is not a valid intent type.', true));
    }
  } else if (reqType === 'SessionEndedRequest') {
    res.json(buildResponse('Thank You', '', 'Thank you for using DC Metro App. Have a nice day.', true));
  } else {
    res.json(buildResponse('Invalid Request Type', 'Invalid Request Type', 'Something went wrong, your request was invalid', true));
  }
});

module.exports = router;
