var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var controllers = require('./controllers');

app.use(bodyParser.json());
app.use(controllers);

app.set('port', (process.env.PORT || 5000));

var server = app.listen(app.get('port'), function() {
  console.log('App listening on port', app.get('port'));
});

module.exports.app = app;
