'use strict';
const AWS = require('aws-sdk');

const storage = (function () {
  const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

  let UserSettings = function (session, settings) {
    if (settings) {
      this.settings = settings;
    } else {
      this.settings = {
        home: null
      };
    }
    this._session = session;
  };

  UserSettings.prototype = {
    save: function (callback) {
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
      }, (err, settings) => {
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
    loadUserSettings: (session, callback) => {
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
      }, (err, settings) => {
        let userSettings;
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
    newUserSettings: (session) => {
      return new UserSettings(session);
    }
  };
})();

module.exports = storage;
