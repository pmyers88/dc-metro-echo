/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the 'License'). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';
var AWS = require('aws-sdk');

var storage = (function () {
  var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

  function UserSettings (session, settings) {
    if (settings) {
      this.settings = settings;
    } else {
      this.settings = {
        home: null
      };
    }
    this._session = session;
  }

  UserSettings.prototype = {
    save: function (callback) {
      // save the game states in the session,
      // so next time we can save a read from dynamoDB
      this._session.attributes.settings = this.settings;
      // see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#putItem-property
      // for formatting info
      dynamodb.putItem({
        TableName: 'MetroTransitUserData',
        Item: {
          CustomerId: {
            S: this._session.user.userId
          },
          settings: {
            S: JSON.stringify(this.settings)
          }
        }
      }, function (err, settings) {
        if (err) {
          console.log(err, err.stack);
        }
        if (callback) {
          callback();
        }
      });
    }
  };

  return {
    loadUserSettings: function (session, callback) {
      if (session.attributes.userSettings) {
        console.log('get user settings from session=' + session.attributes.userSettings);
        callback(new UserSettings(session, session.attributes.userSettings));
        return;
      }
      dynamodb.getItem({
        TableName: 'MetroTransitUserData',
        Key: {
          CustomerId: {
            S: session.user.userId
          }
        }
      }, function (err, settings) {
        var userSettings;
        if (err) {
          console.log(err, err.stack);
          userSettings = new UserSettings(session);
          session.attributes.userSettings = userSettings.settings;
          callback(userSettings);
        } else if (settings.Item === undefined) {
          userSettings = new UserSettings(session);
          session.attributes.userSettings = userSettings.settings;
          callback(userSettings);
        } else {
          console.log('got user settings from dynamodb=' + settings.Item.settings.S);
          userSettings = new UserSettings(session, JSON.parse(settings.Item.settings.S));
          session.attributes.userSettings = userSettings.settings;
          callback(userSettings);
        }
      });
    },
    newUserSettings: function (session) {
      return new UserSettings(session);
    }
  };
})();
module.exports = storage;
