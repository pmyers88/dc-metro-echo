var _ = require('lodash');
var corrections = require('../resources/station_corrections');
var abbreviations = require('../resources/abbreviations');
var props = require('../resources/properties');

var changeTypeLookup = {
  correction: corrections,
  abbreviation: abbreviations['stations']
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

exports.makeGetStationResponseText = function (trainArrivals, stationName) {
  var responseText = '';
  if (_.size(trainArrivals) === 0) {
    responseText = props.stationNoArrivalsSpeechOutput;
  } else if (_.size(trainArrivals) === 1) {
    var destinationStationName = _.keys(trainArrivals)[0];
    responseText = this.replaceAbbreviations('The next train to ' + destinationStationName + ' arrives in ' +
      trainArrivals[destinationStationName] + ' minutes. There are no other trains arriving at ' + stationName +
      ' in the next 20 minutes.', abbreviations['arrivals']);
  } else {
    responseText = 'Are you going to ' + this.joinListConjunction(_.keys(trainArrivals), ', ', ' or ') + '?';
  }
  return responseText;
};

exports.makeGetDestinationResponseText = function (arrivalTimes, destinationStationName) {
  var brdOrArr = _.remove(arrivalTimes, function (arrivalTime) {
    return arrivalTime === 'BRD' || arrivalTime === 'ARR';
  });
  var responseText = '';
  if (_.size(brdOrArr) > 0) {
    responseText += this.replaceAbbreviations('The next train to ' + destinationStationName + ' is ' + brdOrArr[0] +
      ' now.', abbreviations['arrivals']);
    if (_.size(arrivalTimes) > 0) {
      responseText += ' There ' + (arrivalTimes.length === 1
        ? 'is' : 'are') + ' also ' + (arrivalTimes.length === 1
        ? 'a train' : 'trains') + ' arriving in ' + (this.joinListConjunction(arrivalTimes, ', ', ' and ')) + ' minutes.';
    }
  } else {
    responseText = 'The next ' + (arrivalTimes.length === 1 ? 'train' : arrivalTimes.length + ' trains') + ' to ' +
      destinationStationName + (arrivalTimes.length === 1 ? ' arrives' : ' arrive') + ' in ' +
      this.joinListConjunction(arrivalTimes, ', ', ' and ') + ' minutes.';
  }
  return responseText;
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
