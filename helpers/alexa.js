var _ = require('lodash');
var utils = require('./utils');

function AlexaRouter() {
  this._defaultResponse = function(req, res) {
    res.json(buildResponse('Unknown Request Method', 'Unknown Request Method', 'This app doesn\'t know how to handle a ' + req.body.request.type + ' request.'));
  };
  this.onIntentRequest = {};
  this.onLaunchRequest = this._defaultResponse;
  this.onSessionEndedRequest = this._defaultResponse;

  this.handleRequest = _.bind(function(req, res) {
    console.log(this.onIntentRequest);
    var requestMethod = _.isFunction(this['on' + req.body.request.type]) ?
      this['on' + req.body.request.type] : this['on' + req.body.request.type]['on' + req.body.request.intent.name]; 
    if (_.isFunction(requestMethod)) {
      requestMethod(req, res);
    } else {
      this._defaultResponse(req, res); 
    }
  }, this);
}

var buildResponse = function(title, subtitle, content, shouldEndSession, sessionAttributes) {
  var response = {
    version: '1.0',
    response: {
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
  if (!utils.isNullOrUndefined(sessionAttributes)) {
    _.extend(response, { sessionAttributes: sessionAttributes });
  }
  return response;
};

module.exports = {
  AlexaRouter: AlexaRouter,
  buildResponse: buildResponse
};
