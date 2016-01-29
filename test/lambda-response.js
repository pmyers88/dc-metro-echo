var getStationResponse = function() {

};

{
  "session": {
    "sessionId": "SessionId.3a81518e-18b9-4a74-86fc-5ec827a1e69e",
    "application": {
      "applicationId": "amzn1.echo-sdk-ams.app.fb5e684b-6c64-4804-ac4f-8891749a7d89"
    },
    "attributes": null,
    "user": {
      "userId": "amzn1.account.AHDZABY7TT3ONRLYCUB7TO47Z5YQ",
      "accessToken": null
    },
    "new": true
  },
  "request": {
    "type": "IntentRequest",
    "requestId": "EdwRequestId.04485d2c-a06a-4ff8-8726-e198b796c43c",
    "timestamp": 1444269674309,
    "intent": {
      "name": "GetStation",
      "slots": {
        "station": {
          "name": "station",
          "value": "gallery place"
        }
      }
    },
    "reason": null
  }
};
module.exports = {
  getStationResponse: getStationResponse
};
