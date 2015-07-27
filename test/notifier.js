require('dotenv').load();
var Notifier = require('../src/notifier');
var expect = require('chai').expect;

describe('Notifier', function () {
  it('should add tasks properly', function (done) {
    this.timeout(100000);
    var notifier = new Notifier();
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

    notifier
      .addTask(article)
      .then(function(task) {
        expect(task.name).to.equal('Charts on article "' + article.title + '"');
        expect(task.notes).to.equal(article.url);
        done();
      });
  });
});
