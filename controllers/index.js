var express = require('express');
var router = express.Router();

router.use('/api/v1/echo_request', require('./metro_transit_api'));

router.get('/', function(req, res) {
  res.send('DC Metro App is up and ready to go!!!');
});

module.exports = router;
