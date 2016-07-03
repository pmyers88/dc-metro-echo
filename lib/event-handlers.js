var props = require('../resources/properties');

var registerEventHandlers = function (eventHandlers) {
  eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log('MetroTransit onSessionStarted requestId: ' + sessionStartedRequest.requestId +
        ', sessionId: ' + session.sessionId);
  };

  eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log('MetroTransit onLaunch requestId: ' + launchRequest.requestId +
        ', sessionId: ' + session.sessionId);
    response.ask(props.launchSpeechOutput, props.launchRepromptOutput);
  };

  eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log('MetroTransit onSessionEnded requestId: ' + sessionEndedRequest.requestId +
        ', sessionId: ' + session.sessionId);
  };
};

exports.register = registerEventHandlers;
