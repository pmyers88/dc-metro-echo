var request = require('request');

var props = require('../resources/properties');
var secrets = require('../secret/secrets');

var wmataReq = request.defaults({
  baseUrl: props.wmata_base_url,
  qs: secrets.apiKey
});

var WmataApi = function() {};

WmataApi.prototype.getWmataResponse = function(endpoint, response, callback) {
  wmataReq(endpoint, function(error, res, body) {
    if (!error && res.statusCode === 200) {
      callback(JSON.parse(body));
    } else {
      console.error(endpoint.concat(': Error with WMATA'), error);
      response.tell(props.wmataErrorSpeechOutput);
    }
  });
};


module.exports = new WmataApi();