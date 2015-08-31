var express = require('express');
var router = express.Router();
var _ = require('lodash');

var alexaRouter = require('./metro_transit_alexa_api');

router.get('/', function(req, res) {
  res.send('Welcome to the DC Metro App api!!!');
});

router.post('/', alexaRouter);

module.exports = router;
