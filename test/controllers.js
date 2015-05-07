var should = require('should');
var assert = require('assert');
var request = require('supertest');

describe('Controllers', function() {
  var appUrl = 'metro.dev:5000';
  var apiUrl = 'api.metro.dev:5000';

  describe('app', function() {
    describe('GET /', function() {
      it('should return a welcome message', function(done) {
        request(appUrl)
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
        request(apiUrl)
          .get('/v1/echo_request')
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
        it('should welcome the user to the app');
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
