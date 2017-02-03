"use strict";

// this is only necessary for running locally
require('dotenv').load();

var Notifier = require('../src/notifier');
var expect = require('chai').expect;

let mockSlack = {
  postTask: function (webhook, task, link) {
    expect(link).to.equal('https://app.asana.com/0/42711769299233/id');
    return Promise.resolve('done');
  },
  postMetadataTask: function (webhook, article) {
    expect(article.metadata.validMetadata).to.equal(false);
    return Promise.resolve('done');
  }
};

let mockAsana = {
  createTask: function (article) {
    return Promise.resolve({
      id: 'id',
      name: 'name',
      notes: 'notes'
    });
  }
};

let mockPostgres = {
    insertItem: function (article) { return; }
};

describe('Notifier', function () {
  it('Should add tasks and notify slack group', function (done) {
    var notifier = new Notifier(mockSlack, mockAsana, mockPostgres);
    var article = {
      "url": "http://www.ft.com/cms/s/2c67f078-2c6d-11e5-8613-e7aedbb7bdb7.html",
      "publishedDate": "2015-07-17T14:05:32.000Z",
      "title": "China breaks 6-year silence on gold reserves",
      "images": [
        {
          "url": "http://com.ft.imagepublish.prod.s3.amazonaws.com/ac2da5e8-2c89-11e5-acfb-cbd2e1c81cca",
          "stamps": [
            {
              "Author": "stephen.smith@ft.com"
            },
            {
              "Software": "Nightingale"
            }
          ],
          "isNightingale": true
        }
      ],
      "hasNightingale": true
    };

    notifier.processArticle(article)
      .then(result => {
        expect(result).to.equal('done');
        done();
      }).catch(err => {
      done(err);
    });
  });

  it('Should notify slack group about missing metadata', function (done) {
    var notifier = new Notifier(mockSlack, mockAsana, mockPostgres);
    var article = {
      "url": "http://www.ft.com/cms/s/2c67f078-2c6d-11e5-8613-e7aedbb7bdb7.html",
      "publishedDate": "2015-07-17T14:05:32.000Z",
      "title": "China breaks 6-year silence on gold reserves",
      "images": [],
      "hasNightingale": false,
      "metadata": {
        "id": "2c67f078-2c6d-11e5-8613-e7aedbb7bdb7",
        "validMetadata": false,
        "hasPrimarySection": true,
        "hasAuthors": true,
        "hasPrimaryTheme": false,
        "isBlog": false
      }
    };

    notifier.processMetadata(article)
      .then(result => {
        expect(result).to.equal('done');
        done();
      }).catch(err => {
      done(err);
    });
  });

});
