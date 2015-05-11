var should = require('should');
var assert = require('assert');
var request = require('supertest');
var app = require('../app').app;

describe('Controllers', function() {

  describe('app', function() {
    describe('GET /', function() {
      it('should return a welcome message', function(done) {
        request(app)
          .get('/')
          .expect(200)
          .end(function(err, res) {
            if (err) throw err;
            res.text.should.equal('DC Metro App is up and ready to go!!!');
            done();
          });
      });
    });
  });

  describe('api', function() {
    describe('GET /api/v1/echo_request', function() {
      it('should return a welcome message', function(done) {
        request(app)
          .get('/api/v1/echo_request')
          .expect(200)
          .end(function(err, res) {
            if (err) throw err;
            res.text.should.equal('Welcome to the DC Metro App api!!!');
            done();
          });
      });
    });
    describe('POST /api/v1/echo_request', function() {
      describe('LaunchRequest', function() {
        it('should welcome the user to the app', function(done) {
          request(app)
            .post('/api/v1/echo_request')
            .send({
              version: '1.0',
              session: {
                new: true,
                sessionId: 'amznSessionId',
                attributes: {},
                user: {
                  userId: 'amznUserId'
                }
              },
              request: {
                type: 'LaunchRequest',
                requestId: 'amznReqId'
              }
            })
            .expect(200)
            .end(function(err, res) {
              if (err) throw err;
              res.body.version.should.equal('1.0');
              res.body.response.outputSpeech.type.should.equal('PlainText');
              res.body.response.outputSpeech.text.should.equal('Welcome to the DC Metro App! How can I help you?');
              res.body.response.card.type.should.equal('Simple');
              res.body.response.card.title.should.equal('DC Metro Echo');
              res.body.response.card.subtitle.should.equal('Metro App');
              res.body.response.card.content.should.equal('Welcome to the DC Metro App! How can I help you?');
              res.body.response.shouldEndSession.should.equal(false);
              done();
            });
        });
      });
      describe('IntentRequest', function() {
        describe('GetStation', function() {
          it('should ask user for destination', function(done) {
            request(app)
              .post('/api/v1/echo_request')
              .send({
                version: '1.0',
                session: {
                  new: true,
                  sessionId: 'amznSessionId',
                  attributes: {},
                  user: {
                    userId: 'amznUserId'
                  }
                },
                request: {
                  type: 'IntentRequest',
                  requestId: 'amznReqId',
                  intent: {
                    name: 'GetStation',
                    slots: {
                      station: {
                        name: 'station',
                        value: 'ballston'
                      }
                    }
                  }
                }
              })
              .expect(200)
              .end(function(err, res) {
                if (err) throw err;
                res.body.version.should.equal('1.0');
                res.body.response.outputSpeech.type.should.equal('PlainText');
                res.body.response.outputSpeech.text.should.startWith('Are you going to');
                res.body.response.card.type.should.equal('Simple');
                res.body.response.card.title.should.equal('Destination Needed');
                res.body.response.card.subtitle.should.equal('');
                res.body.response.card.content.should.startWith('Are you going to');
                res.body.response.shouldEndSession.should.equal(false);
                done();
              });
          });
        });
        describe('GetDestinationStation', function() {
          it('should provide user with arrival times for destination station', function(done) {
            request(app)
              .post('/api/v1/echo_request')
              .send({
                version: '1.0',
                session: {
                  new: true,
                  sessionId: 'amznSessionId',
                  attributes: {},
                  user: {
                    userId: 'amznUserId'
                  }
                },
                request: {
                  type: 'IntentRequest',
                  requestId: 'amznReqId',
                  intent: {
                    name: 'GetDestinationStation',
                    slots: {
                      destinationStation: {
                        name: 'destinationStation',
                        value: 'New Carrollton'
                      }
                    }
                  }
                },
                sessionAttributes: {
                  'New Carrollton': [
                    '5',
                    '13'
                  ]
                }
              })
              .expect(200)
              .end(function(err, res) {
                if (err) throw err;
                res.body.version.should.equal('1.0');
                res.body.response.outputSpeech.type.should.equal('PlainText');
                res.body.response.outputSpeech.text.should.equal('The next 2 trains heading to New Carrollton arrive in 5 and 13 minutes.');
                res.body.response.card.type.should.equal('Simple');
                res.body.response.card.title.should.equal('Arrival Times');
                res.body.response.card.subtitle.should.equal('Here are the arrival times for trains heading to New Carrollton.');
                res.body.response.card.content.should.equal('The next 2 trains heading to New Carrollton arrive in 5 and 13 minutes.');
                res.body.response.shouldEndSession.should.equal(true);
                done();
              });
          });
        });

      });
      describe('SessionEndedRequest', function() {
        it('should end the session', function(done) {
          request(app)
            .post('/api/v1/echo_request')
            .send({
              version: '1.0',
              session: {
                new: true,
                sessionId: 'amznSessionId',
                attributes: {},
                user: {
                  userId: 'amznUserId'
                }
              },
              request: {
                type: 'SessionEndedRequest',
                requestId: 'amznReqId',
                reason: 'USER_INITIATED'
              }
            })
            .expect(200)
            .end(function(err, res) {
              if (err) throw err;
              res.body.version.should.equal('1.0');
              res.body.response.outputSpeech.type.should.equal('PlainText');
              res.body.response.outputSpeech.text.should.equal('Thank you for using DC Metro App. Have a nice day.');
              res.body.response.card.type.should.equal('Simple');
              res.body.response.card.title.should.equal('Thank You');
              res.body.response.card.subtitle.should.equal('');
              res.body.response.card.content.should.equal('Thank you for using DC Metro App. Have a nice day.');
              res.body.response.shouldEndSession.should.equal(true);
              done();
            });
        });
      });
    });
  });
});
