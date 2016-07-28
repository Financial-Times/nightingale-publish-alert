require('dotenv').load();

let slack = require('../src/slack');
let expect = require('chai').expect;

let webhook = process.env.SLACK_WEB_HOOK;

describe('Slack', function () {
  it('Should send hi to the configured slack webhook', function(done) {
    slack.post(webhook, 'hi')
         .then(response => {
           expect(response.statusCode).to.equal(200);
           done();
         });
  });
});
