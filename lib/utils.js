var _ = require('lodash');
var corrections = require('../resources/station_corrections');
var outputFilters = require('../resources/output_filters');
var props = require('../resources/properties');
var stations = require('../resources/stations').Stations;

var changeTypeLookup = {
  correction: corrections,
  abbreviation: outputFilters['stations']
};

exports.changeStationName = function (stationName, changeType) {
  var mapping = changeTypeLookup[changeType];
  return _.has(mapping, stationName)
    ? mapping[stationName]
    : stationName;
};

exports.joinListConjunction = function (list, separator, conjuction) {
  var joinedList = '';
  if (list.length === 1) {
    joinedList = list[0];
  } else {
    joinedList = list.slice(0, list.length - 1).join(separator) +
      (list.length > 1
        ? conjuction + _.last(list)
        : '');
  }
  return joinedList;
};

exports.makeGetStationResponse = function (trainArrivals, stationName) {
  var text = '';
  var title = '';
  if (_.size(trainArrivals) === 0) {
    text = props.stationNoArrivalsSpeechOutput;
    title = props.stationNoArrivalsTitle;
  } else if (_.size(trainArrivals) === 1) {
    var destinationStationName = _.keys(trainArrivals)[0];
    var destinationStationTitle = this.titleize(destinationStationName);
    var stationNameTitle = this.titleize(stationName);
    text = this.replaceAbbreviations('The next train to ' + destinationStationTitle + ' arrives in ' +
      trainArrivals[destinationStationName] + ' minutes. There are no other trains arriving at ' + stationNameTitle +
      ' in the next 20 minutes.', outputFilters['arrivals']);
    title = props.stationArrivalsTitle + stationNameTitle;
  } else {
    var trainArrivalTitles = _.map(_.keys(trainArrivals), this.titleize);
    text = 'Are you traveling in the direction of ' + this.joinListConjunction(trainArrivalTitles, ', ', ' or ') + '?';
  }
  return {
    text: text,
    title: title
  };
};

exports.makeGetDestinationResponse = function (arrivalTimes, destinationStationName) {
  var brdOrArr = _.remove(arrivalTimes, function (arrivalTime) {
    return arrivalTime === 'BRD' || arrivalTime === 'ARR';
  });
  var destinationStationTitle = this.titleize(destinationStationName);
  var text = '';
  var title = props.stationArrivalsTitle + destinationStationTitle;
  if (_.size(brdOrArr) > 0) {
    // in the unlikely even that there are back to back BRD and ARR, just tell them about BRD. they won't miss anything
    text += this.replaceAbbreviations('The next train to ' + destinationStationTitle + ' is ' + brdOrArr[0] +
      ' now.', outputFilters['arrivals']);
    if (_.size(arrivalTimes) > 0) {
      text += ' Also, there ' + (arrivalTimes.length === 1
        ? 'is a train' : 'are trains') + ' arriving in ' + (this.joinListConjunction(arrivalTimes, ', ', ' and ')) + ' minutes.';
    }
  } else {
    text = 'The next ' + (arrivalTimes.length === 1 ? 'train' : arrivalTimes.length + ' trains') + ' to ' +
      destinationStationTitle + (arrivalTimes.length === 1 ? ' arrives' : ' arrive') + ' in ' +
      this.joinListConjunction(arrivalTimes, ', ', ' and ') + ' minutes.';
  }
  return {
    text: text,
    title: title
  };
};

exports.replaceAbbreviations = function (text, replacements) {
  _.each(replacements, function (val, key) {
    // need a regex to replace globally and to not replace 'Blue' with 'Bluee'
    var replaceRegex = new RegExp('(' + key + ')(\\W)', 'g');
    text = _.replace(text, replaceRegex, function (match, group0, group1) {
      return val + group1;
    });
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
  return _.find(stations, ['Name', this.titleize(stationName)]);
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
  return str.replace(/\w+(\W|$)/g, function (match) {
    return _.upperFirst(match);
  });
};
