var _ = require('lodash');
var correction = require('../resources/station_corrections');
var abbreviation = require('../resources/station_abbreviations');
var props = require('../resources/properties');
var stations = require('../resources/stations').Stations;

var changeTypeLookup = {
  correction: correction,
  abbreviation: abbreviation
};

exports.isNullOrUndefined = function (val) {
  return _.isNull(val) || _.isUndefined(val);
};

exports.changeStationName = function (stationName, changeType) {
  var mapping = changeTypeLookup[changeType];
  return _.has(mapping, stationName)
    ? mapping[stationName]
    : stationName;
};

exports.joinListConjuction = function (list, separator, conjuction) {
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

exports.makeGetStationResponseText = function (trainArrivals, stationName) {
  var responseText = '';
  if (_.size(trainArrivals) === 0) {
    responseText = props.stationNoArrivalsSpeechOutput;
  } else if (_.size(trainArrivals) === 1) {
    var destinationStationName = _.keys(trainArrivals)[0];
    responseText = 'The next train to ' + destinationStationName + ' arrives in ' +
      trainArrivals[destinationStationName] + ' minutes. There are no other trains arriving at ' + stationName +
      ' in the next 20 minutes.';
  } else {
    responseText = 'Are you going to ' + this.joinListConjuction(_.keys(trainArrivals), ', ', ' or ') + '?';
  }
  return responseText;
};

exports.sanitizeServiceAdvisories = function (serviceAdvisoryText) {
  var replacements = {
    btwn: 'between',
    Blu: 'Blue',
    Org: 'Orange'
  };
  _.each(replacements, function (val, key) {
    // need a regex to replace globally and to not replace 'Blue' with 'Bluee'
    var replaceRegex = new RegExp('(' + key + ')(\\W)', 'g');
    serviceAdvisoryText = _.replace(serviceAdvisoryText, replaceRegex, function (match, group0, group1) {
      return val + group1;
    });
  });
  return serviceAdvisoryText;
};

/**
 * Returns the WMATA train station object with matching stationName from cached WMATA API
 * https://api.wmata.com/Rail.svc/json/jStations
 *
 * @param  {any} stationName
 * @return {object} WMATA train station
 */
exports.findStationByName = function (stationName) {
  return _.find(stations, ['Name', stationName]);
};
