var _ = require('lodash');
var correction = require('../resources/station_corrections');
var abbreviation = require('../resources/station_abbreviations');
var properties = require('../resources/properties')

var changeTypeLookup = {
  correction: correction,
  abbreviation: abbreviation
};

var isNullOrUndefined = function(val) {
  return _.isNull(val) || _.isUndefined(val);
};

var changeStationName = function(stationName, changeType) {
  var mapping = changeTypeLookup[changeType];
  return _.has(mapping, stationName) ?
    mapping[stationName] :
    stationName;
};

var joinListConjuction = function(list, separator, conjuction) {
  var joinedList = '';
  if (list.length === 1) {
    joinedList = list[0];
  } else {
    joinedList = list.slice(0, list.length - 1).join(separator) +
      (list.length > 1 ?
        conjuction + _.last(list) :
        '');
  }
  return joinedList;
};

module.exports = {
  isNullOrUndefined: isNullOrUndefined,
  changeStationName: changeStationName,
  joinListConjuction: joinListConjuction,
  properties: properties
};
