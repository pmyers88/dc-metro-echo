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
    describe('GET /v1/echo_request', function() {
      it('should return a welcome message', function(done) {
        request(app)
          .get('/v1/echo_request')
          .set('Host', 'api.example.com')
          .expect(200)
          .end(function(err, res) {
            if (err) throw err;
            res.text.should.equal('Welcome to the DC Metro App api!!!');
            done();
          });
      });
    });
    describe('POST /v1/echo_request', function() {
      describe('LaunchRequest', function() {
        it('should welcome the user to the app', function(done) {
          request(app)
            .post('/v1/echo_request')
            .set('Host', 'api.example.com')
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
              res.body.response.shouldEndSession.should.equal(false);
              done();
            });
        });
      });
      describe('IntentRequest', function() {
        describe('GetMetroTimes', function() {
          it('should return metro times');
        });
      });
      describe('SessionEndedRequest', function() {
        it('should end the session');
      });
    });
  });
});
