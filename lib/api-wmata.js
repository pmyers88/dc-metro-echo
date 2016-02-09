var request = require('request');
var props = require('../resources/properties');

var wmataReq = request.defaults({
  baseUrl: props.wmata_base_url,
  qs: { api_key: process.env.WMATA_API_KEY }
});

exports.get = function (endpoint, response, callback) {
  wmataReq(endpoint, function (error, res, body) {
    if (!error && res.statusCode === 200) {
      callback(JSON.parse(body));
    } else {
      console.error(endpoint.concat(': Error with WMATA'), error);
      response.tell(props.wmataErrorSpeechOutput);
    }
  });
};
