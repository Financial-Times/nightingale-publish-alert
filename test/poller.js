require('dotenv').load();

// mock the apis
require('./mockApis');

var expect = require('chai').expect;

describe('Poller', function() {
  var Poller = require('../src/poller');
  var poller = new Poller();

  it('should be a function', function() {
    expect(typeof Poller).to.equal('function');
  });

  it('should be a constructor', function() {
    expect(typeof poller.poll).to.equal('function');
  });

  it('should poll correctly', function(done) {
    poller.poll()
    .then(function(articles) {
      expect(articles.length).to.equal(1);
      // there should be two images, one from the img, another from
      // clamo
      expect(articles[0].images.length).to.equal(2);
      done();
    });
  });

  it('should poll correctly when there is no imageSets', function(done) {
    poller.poll()
    .then(function(articles) {
      expect(articles.length).to.equal(1);
      expect(articles[0].images.length).to.equal(1);
      done();
    });
  });

});
