"use strict";

require('dotenv').load();

let expect = require('chai').expect;
let config = require('./mock-upp-endpoints');

var moment = require('moment-timezone');

let plugin = require('superagent-promise-plugin');
let requests = plugin.patch(require('superagent'));
let superagentMock = require('superagent-mock')(requests, config);

let NotificationsApi = require('../src/ft-api');

let mockConfig = {
  FT_API_URL: 'http://upp.ft.com',
  FT_API_KEY: 'fakeKey'
};

describe('NotificationsApi', function () {

  it('Should load notifications from UP', function(done) {
    let api = new NotificationsApi(mockConfig, requests);
    api.getNotifications(moment.utc().tz('Europe/London').subtract(15000, 'ms')).then(notifications =>{
      expect(notifications).to.not.be.empty;
      expect(notifications.length).to.equal(1);
      expect(notifications[0].type).to.equal('UPDATE');
      done();
    }).catch(err => {
      done(err);
    });
  });

  it('Should fetch the article from UP', function(done) {
    let api = new NotificationsApi(mockConfig, requests);
    api.fetchArticle({
      apiUrl: 'http://upp.ft.com/content/uuid'
    }).then(article => {
      expect(article.title).to.equal('Title');
      done();
    }).catch(err => {
      done(err);
    })
  });

  it('Should fail to fetch the article from UP', function(done) {
    let api = new NotificationsApi(mockConfig, requests);
    api.fetchArticle({
      apiUrl: 'http://upp.ft.com/bad/request'
    }).then(article => {
      done(new Error('Should fail!'));
    }).catch(err => {
      done();
    });
  });
});
