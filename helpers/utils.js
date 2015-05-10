var _ = require('lodash');

var isNullOrUndefined = function(val) {
  return _.isNull(val) || _.isUndefined(val);
};

module.exports = {
  isNullOrUndefined: isNullOrUndefined
};
