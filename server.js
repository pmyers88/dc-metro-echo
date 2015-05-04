var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.send('DC Metro App is up and ready to go!');
});

app.post('/echo_request/parse', function(req, res) {
  var respJSON = null;
  if (req.body.request.type === 'LaunchRequest') {
    respJSON = buildResponse('DC Metro Echo', 'Metro App', 'Welcome to the DC Metro App! How can I help you?', false);
  }
  res.json(respJSON);
});

buildResponse = function(title, subtitle, content, shouldEndSession) {
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
