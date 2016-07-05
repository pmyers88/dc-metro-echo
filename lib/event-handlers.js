'use strict';
const _ = require('lodash');

const storage = require('./storage');
const props = require('../resources/properties');

function registerEventHandlers (eventHandlers) {
  eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log(`MetroTransit onSessionStarted requestId: ${sessionStartedRequest.requestId}` +
      `, sessionId: ${session.sessionId}`);
  };

  eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log(`MetroTransit onLaunch requestId: ${launchRequest.requestId}` +
      `, sessionId: ${session.sessionId}`);
    // Speak welcome message and ask user questions
    // based on whether the home station has been set.
    storage.loadUserSettings(session, userSettings => {
      let speechOutput = '';
      let reprompt = '';
      if (_.isNil(userSettings.settings.home)) {
        speechOutput += props.setHomeStationSpeechOutput;
        reprompt = props.setHomeStationRepromptSpeechOutput;
      } else {
        speechOutput += props.launchSpeechOutput;
        reprompt = props.launchRepromptOutput;
      }
      response.ask(speechOutput, reprompt);
    });
  };

  eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log(`MetroTransit onSessionEnded requestId: ${sessionEndedRequest.requestId}` +
      `, sessionId: ${session.sessionId}`);
  };
}

exports.register = registerEventHandlers;
