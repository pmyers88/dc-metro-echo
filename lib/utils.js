'use strict';
const _ = require('lodash');
const corrections = require('../resources/station_corrections');
const outputFilters = require('../resources/output_filters');
const props = require('../resources/properties');
const stations = require('../resources/stations').Stations;

const changeTypeLookup = {
  correction: corrections,
  abbreviation: outputFilters['stations']
};

exports.changeStationName = function (stationName, changeType) {
  const mapping = changeTypeLookup[changeType];
  return _.has(mapping, stationName)
    ? mapping[stationName]
    : stationName;
};

exports.joinListConjunction = function (list, separator, conjuction) {
  const commaSeparatedWords = list.slice(0, list.length - 1).join(separator);
  return `${commaSeparatedWords.length
    ? (`${commaSeparatedWords} ${conjuction} `)
    : ''}` +
    `${_.last(list)}`;
};

exports.makeGetTrainsResponse = function (trainArrivals, stationName) {
  let text = '';
  let title = '';
  // gracefully handle stationName is nil, assuming the title in unwanted
  const stationNameTitle = _.isNil(stationName) ? '' : this.titleize(stationName);
  if (_.size(trainArrivals) === 0) {
    text = `Sorry, there are no trains arriving at ${stationNameTitle} in the next 20 minutes.`;
    title = props.stationNoArrivalsTitle;
  } else if (_.size(trainArrivals) === 1) {
    const destinationStationName = _.keys(trainArrivals)[0];
    const destinationStationTitle = this.titleize(destinationStationName);
    text = this.replaceAbbreviations(`The next train to ${destinationStationTitle} arrives in ` +
      `${trainArrivals[destinationStationName]} minutes. There are no other trains arriving at ` +
      `${stationNameTitle} in the next 20 minutes.`, outputFilters['arrivals']);
    title = props.stationArrivalsTitle + stationNameTitle;
  } else {
    const trainArrivalTitles = _.map(_.keys(trainArrivals), this.titleize);
    text = `Are you traveling in the direction of ${this.joinListConjunction(trainArrivalTitles, ', ', 'or')}?`;
  }
  return {
    text: text,
    title: title
  };
};

exports.makeGetDestinationResponse = function (arrivalTimes, destinationStationName) {
  const brdOrArr = _.remove(arrivalTimes, (arrivalTime) => arrivalTime === 'BRD' || arrivalTime === 'ARR');
  const destinationStationTitle = this.titleize(destinationStationName);
  let text = '';
  let title = props.stationArrivalsTitle + destinationStationTitle;
  if (_.size(brdOrArr) > 0) {
    // in the unlikely even that there are back to back BRD and ARR, just tell them about BRD. they won't miss anything
    text += this.replaceAbbreviations(`The next train to ${destinationStationTitle} is ${brdOrArr[0]} now.`,
      outputFilters['arrivals']);
    if (_.size(arrivalTimes) > 0) {
      text += ` Also, there ${arrivalTimes.length === 1
        ? 'is a train'
        : 'are trains'} arriving in ${this.joinListConjunction(arrivalTimes, ', ', 'and')} minutes.`;
    }
  } else {
    text = `The next ${arrivalTimes.length === 1
      ? 'train'
      : `${arrivalTimes.length} trains`} to ${destinationStationTitle} ${arrivalTimes.length === 1
        ? 'arrives'
        : 'arrive'} in ${this.joinListConjunction(arrivalTimes, ', ', 'and')} minutes.`;
  }
  return {
    text: text,
    title: title
  };
};

exports.replaceAbbreviations = function (text, replacements) {
  _.each(replacements, (val, key) => {
    // need a regex to replace globally and to not replace 'Blue' with 'Bluee'
    const replaceRegex = new RegExp('(' + key + ')(\\W)', 'g');
    text = _.replace(text, replaceRegex, (match, group0, group1) => val + group1);
  });
  return text;
};

/**
 * Returns the WMATA train station object with matching stationName from cached WMATA API
 * https://api.wmata.com/Rail.svc/json/jStations
 *
 * @param  {any} stationName
 * @return {object} WMATA train station
 */
exports.findStationByName = function (stationName) {
  return _.isNil(stationName) ? null : _.find(stations, ['Name', this.titleize(stationName)]);
};

/**
 * Capitalizes the first letter of all words in a string;
 * leaves other letters unchanged.
 * This fixes a problem other titleization libraries have where they would do
 * the following conversions:
 * Virginia Square-GMU -> Virginia Square-Gmu
 * NoMa-Gallaudet U -> Noma-Gallaudet U
 * See https://lodash.com/docs#upperFirst
 *
 * @param  {String} string to by titleize'd
 * @return {String} the titleize'd string
 */
exports.titleize = function (str) {
  return str.replace(/\w+(\W|$)/g, match => _.upperFirst(match));
};
