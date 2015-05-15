var fs = require('fs');
var path = require('path');
var morgan = require('morgan');
var fileStreamRotator = require('file-stream-rotator');
var bodyParser = require('body-parser');
var express = require('express');
var https = require('https');
var http = require('http');

var controllers = require('./controllers');

var app = express();
var logDirectory = path.join(__dirname, '/log');

fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

var accessLogStream = fileStreamRotator.getStream({
  filename: logDirectory + '/access-%DATE%.log',
  frequency: 'daily',
  verbose: false
});

app.use(morgan('combined', { stream: accessLogStream }));
app.use(bodyParser.json());
app.use(controllers);

var https_options = {
  key: fs.readFileSync('/etc/ssl/certs/server.key'),
  cert: fs.readFileSync('/etc/ssl/certs/server.crt'),
  ca: fs.readFileSync('/etc/ssl/certs/ca.crt')
};

http.createServer(app).listen(process.env.PORT || 5000);
https.createServer(https_options, app).listen(process.env.SECURE_PORT || 4443);

module.exports.app = app;
