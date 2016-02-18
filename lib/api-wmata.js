var request = require('request');

var wmataReq = request.defaults({
  baseUrl: 'https://api.wmata.com',
  qs: { api_key: process.env.WMATA_API_KEY }
});

exports.get = function (endpoint, successCallback, errorCallback) {
  wmataReq(endpoint, function (error, res, body) {
    if (!error && res.statusCode === 200) {
      successCallback(JSON.parse(body));
    } else if (errorCallback) {
      errorCallback(error || res);
    }
  });
};
