const _ = require('lodash');

const props = require('../resources/properties');
const outputFilters = require('../resources/output_filters');

const utils = require('./utils');
const WmataApi = require('./api-wmata');

const registerIntentHandlers = (intentHandlers) => {
  intentHandlers['AMAZON.HelpIntent'] = (intent, session, response) => {
    response.askWithCard(props.helpSpeechOutput, props.helpCardTitle, props.helpCardText);
  };

  intentHandlers['AMAZON.CancelIntent'] = (intent, session, response) => {
    response.tell(props.abortSpeechOutput);
  };

  intentHandlers['AMAZON.StopIntent'] = (intent, session, response) => {
    response.tell(props.abortSpeechOutput);
  };

  intentHandlers.GetStation = (intent, session, response) => {
    console.info(`Requested Station Name: ${intent.slots.station.value}`);
    const stationName = utils.changeStationName(intent.slots.station.value, 'correction');
    console.info(`Corrected Station Name: ${stationName}`);
    const station = utils.findStationByName(stationName);

    if (_.isNil(station)) {
      if (_.isNil(stationName)) {
        response.ask(props.noStationRequestedSpeechOutput, props.noStationRequestedSpeechOutput);
      } else {
        console.error(`${props.stationNotFoundConsole} ${stationName}.`);
        const notFoundText = `${props.stationNotFoundSpeechOutput}' "${stationName}". ` +
          `${props.stationNotFoundSpeechOutputQuestion}`;
        response.ask(notFoundText, notFoundText);
      }
    } else {
      const stationCode = station.Code;
      const endpoint = props.stationArrivalWmataUrl + stationCode;

      WmataApi.get(endpoint, (body) => {
        const trainArrivals = _.reduce(body.Trains, (result, train) => {
          if (train.DestinationName === 'Train' || train.DestinationName === 'No Passenger') return result;

          const arrivals = result[train.DestinationName] || [];
          arrivals.push(train.Min);
          result[utils.changeStationName(train.DestinationName, 'abbreviation').toLowerCase()] = arrivals;
          return result;
        }, {});

        console.info('Train Arrivals: ', trainArrivals);
        const resp = utils.makeGetStationResponse(trainArrivals, station.Name);
        // if there's > 1 train arriving we need to ask the user which destination they want to go to. otherwise we
        // don't need any more info from the user; we can just tell them when that train is coming or that no trains
        // are coming.
        if (_.size(trainArrivals) > 1) {
          session.attributes = trainArrivals;
          response.ask(resp.text, resp.text);
        } else {
          response.tellWithCard(resp.text, resp.title, resp.text);
        }
      }, function (error) {
        console.error(endpoint.concat(': Error with WMATA'), error);
        response.tellWithCard(props.wmataErrorSpeechOutput, props.wmataErrorTitle, props.wmataErrorSpeechOutput);
      });
    }
  };

  intentHandlers.GetDestinationStation = function (intent, session, response) {
    const sessionAttributes = session.attributes;
    const destinationStationName = intent.slots.destinationStation.value;
    console.info(`Station Name: ${destinationStationName}`);

    if (_.has(sessionAttributes, destinationStationName)) {
      const arrivalTimes = sessionAttributes[destinationStationName];
      const resp = utils.makeGetDestinationResponse(arrivalTimes, destinationStationName);
      response.tellWithCard(resp.text, resp.title, resp.text);
    } else {
      const speechOutput = `${props.stationNotFoundSpeechOutput} ${destinationStationName}. ` +
        `Maybe I misheard you. ${utils.makeGetStationResponse(sessionAttributes).text}`;
      console.error(`${props.stationNotFoundConsole} ${destinationStationName}.`);
      response.ask(speechOutput, speechOutput);
    }
  };

  intentHandlers.GetServiceAdvisories = function (intent, session, response) {
    WmataApi.get(props.serviceAdvisoriesWmataUrl, function (body) {
      const incidents = body.Incidents;
      console.info(`Incidents: ${JSON.stringify(incidents)}`);
      if (_.size(incidents) === 0) {
        response.tellWithCard(props.noServiceAdvisoriesText, props.noServiceAdvisoriesTitle, props.noServiceAdvisoriesText);
        return;
      }
      const incidentList = _.map(incidents, 'Description');
      const advisoriesText = utils.replaceAbbreviations(incidentList.join('\n'), outputFilters['advisories']);
      response.tellWithCard(advisoriesText, props.stationAdvisoriesTitle, advisoriesText);
    }, function (error) {
      console.error(props.serviceAdvisoriesWmataUrl.concat(': Error with WMATA'), error);
      response.tell(props.wmataErrorSpeechOutput, props.wmataErrorTitle, props.wmataErrorSpeechOutput);
    });
  };
};

exports.register = registerIntentHandlers;
