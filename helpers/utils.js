var _ = require('lodash');
var stationCorrections = require('../resources/station_corrections');

var isNullOrUndefined = function(val) {
  return _.isNull(val) || _.isUndefined(val);
};

var fixStationName = function(stationName) {
  return _.has(stationCorrections, stationName) ?
    stationCorrections[stationName] :
    stationName;
};

var joinListConjuction = function(list, separator, conjuction) {
  return list.slice(0, list.length - 1).join(separator) +
    (list.length > 1 ?
      conjuction + _.last(list) :
      '');

};

module.exports = {
  isNullOrUndefined: isNullOrUndefined,
  fixStationName: fixStationName,
  joinListConjuction: joinListConjuction
};
