var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(require('./controllers'));

app.set('port', (process.env.PORT || 5000));

var server = app.listen(app.get('port'), function() {
  console.log('App listening on port', app.get('port'));
});
