'use strict';
const props = require('../resources/properties');

const registerEventHandlers = (eventHandlers) => {
  eventHandlers.onSessionStarted = (sessionStartedRequest, session) => {
    console.log(`MetroTransit onSessionStarted requestId: ${sessionStartedRequest.requestId}` +
      `, sessionId: ${session.sessionId}`);
  };

  eventHandlers.onLaunch = (launchRequest, session, response) => {
    console.log(`MetroTransit onLaunch requestId: ${launchRequest.requestId}` +
      `, sessionId: ${session.sessionId}`);
    response.ask(props.launchSpeechOutput, props.launchRepromptOutput);
  };

  eventHandlers.onSessionEnded = (sessionEndedRequest, session) => {
    console.log(`MetroTransit onSessionEnded requestId: ${sessionEndedRequest.requestId}` +
      `, sessionId: ${session.sessionId}`);
  };
};

exports.register = registerEventHandlers;
