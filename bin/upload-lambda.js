#!/usr/bin/env node

'use strict';

var AWS = require('aws-sdk');
var fs = require('fs');

function deployToLambda () {
  AWS.config.region = 'us-east-1';
  var lambda = new AWS.Lambda();
  var functionName = 'MetroTransit';

  lambda.getFunction({FunctionName: functionName}, function (err, data) {
    if (err) {
      var warning;
      if (err.statusCode === 404) {
        warning = 'Unable to find lambda function ' + functionName + '. ';
        warning += 'Verify the lambda function name and AWS region are correct.';
        console.log(warning);
      } else {
        warning = 'AWS API request failed. ';
        warning += 'Check your AWS credentials and permissions.';
        console.log(warning);
      }
      throw new Error(err);
    }

    var params = {
      FunctionName: functionName
    };

    fs.readFile('./dc-metro-echo.zip', function (err, data) {
      if (err) {
        var warning = 'Error creating zip.';
        console.log(warning);
        throw new Error(err);
      } else {
        params.ZipFile = data;
        lambda.updateFunctionCode(params, function (err, data) {
          if (err) {
            var warning = 'Package upload failed. ';
            warning += 'Check your iam:PassRole permissions.';
            console.log(warning);
            throw new Error(err);
          }
        });
      }
    });
  });
}

deployToLambda();
