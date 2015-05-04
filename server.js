var express = require('express');
var http = require('http');
var _ = require('lodash');
var app = express();
var bodyParser = require('body-parser');

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.send('DC Metro App is up and ready to go!');
});

var wmataOptions = {
  hostname: 'api.wmata.com'
}

var apiKey = 'api_key=' + process.env.WMATA_API_KEY;

app.post('/echo_request/parse', function(req, res) {
  var respJSON = null;
  var reqType = req.body.request.type;
  if (reqType === 'LaunchRequest') {
    respJSON = buildResponse('DC Metro Echo', 'Metro App', 'Welcome to the DC Metro App! How can I help you?', false);
    res.json(respJSON);
  } else if (reqType === 'IntentRequest') {
    http.get(_.assign(wmataOptions, { path: '/Rail.svc/json/jStations?' + apiKey }), function(wmataResp) {
      var body = '';
      wmataResp.on('data', function(chunk) {
        body += chunk;
      });
      wmataResp.on('end', function() {
        var stations = JSON.parse(body).Stations;
        var stationNameHash = {};
        _.forEach(stations, function(station) {
          stationNameHash[station.Name.toLowerCase()] = station;
        });
        var intent = req.body.request.intent;
        if (intent.name === 'GetMetroTimes') {
          var stationName = intent.slots.station.value;
          var stationCode = stationNameHash[stationName].Code;
          http.get(_.assign(wmataOptions, { path: '/StationPrediction.svc/json/GetPrediction/' + stationCode + '?' + apiKey }), function(predictionResp) {
            var predictionBody = '';
            predictionResp.on('data', function(chunk) {
              predictionBody += chunk;
            });
            predictionResp.on('end', function() {
              var trains = JSON.parse(predictionBody).Trains;
              console.log('Trains: ' + JSON.stringify(trains));
              var trainArrivals = _.reduce(trains, function(sentence, train) {
                return sentence + 'The next train to ' + train.DestinationName + ' leaves in ' + train.Min + ' minutes.'
              }, '');
              console.log(trainArrivals);
              res.json(buildResponse('Train Arrivals', 'Here are the train arrivals', trainArrivals, true));
            })
          }).on('error', function(e) {
            console.log('Error getting train predictions: ' + e.message);
          });
        }
      })
    }).on('error', function(e) {
      console.log('Error getting station info: ' + e.message);
    });
  } else if (reqType === 'SessionEndedRequest') {
  } else {
    respJSON = buildResponse('Invalid Request Type', 'Invalid Request Type', 'Something went wrong, your request was invalid', true);
  }
});

var buildResponse = function(title, subtitle, content, shouldEndSession) {
  return {
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
};

var server = app.listen(app.get('port'), function() {
  console.log('App listening on port', app.get('port'));
});
