var fs = require('fs');
var path = require('path');
var morgan = require('morgan');
var fileStreamRotator = require('file-stream-rotator');
var bodyParser = require('body-parser');
var express = require('express');

var controllers = require('./controllers');

var app = express();
var logDirectory = path.join(__dirname, '/log');

var syncDir = fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

var accessLogStream = fileStreamRotator.getStream({
  filename: logDirectory + '/access-%DATE%.log',
  frequency: 'daily',
  verbose: false
});

app.use(morgan('combined', { stream: accessLogStream }));
app.use(bodyParser.json());
app.use(controllers);

app.set('port', (process.env.PORT || 5000));

var server = app.listen(app.get('port'), function() {
  console.log('App listening on port', app.get('port'));
});

module.exports.app = app;
