var express = require('express');
var app = express();
var bodyParser = require('body-parser');

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
		reponse: {
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

var server = app.listen(3000, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log('App listening at http://%s:%s', host, port);
});
