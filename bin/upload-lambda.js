#!/usr/bin/env node

'use strict';

const AWS = require('aws-sdk');
const fs = require('fs');

(function () {
  AWS.config.region = 'us-east-1';
  const lambda = new AWS.Lambda();
  const functionName = 'MetroTransit';

  lambda.getFunction({FunctionName: functionName}, (err, data) => {
    if (err) {
      let warning;
      if (err.statusCode === 404) {
        warning = `Unable to find lambda function ${functionName}. ` +
          `Verify the lambda function name and AWS region are correct.`;
        console.log(warning);
      } else {
        warning = 'AWS API request failed. Check your AWS credentials and permissions.';
        console.log(warning);
      }
      throw new Error(err);
    }

    const params = {
      FunctionName: functionName
    };

    fs.readFile('./dc-metro-echo.zip', (err, data) => {
      if (err) {
        const warning = 'Error creating zip.';
        console.log(warning);
        throw new Error(err);
      } else {
        params.ZipFile = data;
        lambda.updateFunctionCode(params, (err, data) => {
          if (err) {
            const warning = 'Package upload failed. Check your iam:PassRole permissions.';
            console.log(warning);
            throw new Error(err);
          }
        });
      }
    });
  });
}());
