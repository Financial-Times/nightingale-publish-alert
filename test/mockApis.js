var nock = require('nock');
var path = require('path');
require('dotenv').load();

var ftMock = require('./fixtures/ft-api-mock');

var ftApiURLRoot = process.env.FT_API_URL;
var ftApiKey = process.env.FT_API_KEY;
nock(ftApiURLRoot)
  .filteringPath(/since=[^&]*/g, 'since=XXX')
  .get('/content/notifications?since=XXX&apiKey=' + ftApiKey)
  .reply(200, ftMock.first)
  .get('/content/notifications?since=XXX&apiKey=' + ftApiKey)
  .reply(200, ftMock.second)
  .get('/content/bd15e610-1b02-11e5-a130-2e7db721f996?apiKey=' + ftApiKey)
  .reply(200, ftMock.article)
  .get('/content/b694f79a-1aee-11e5-1c67-5c41d9a3bfc9?apiKey=' + ftApiKey)
  .reply(200, ftMock.imageSet)
  .get('/content/b694f79a-1aee-11e5-8201-cbdb03d71480?apiKey=' + ftApiKey)
  .reply(200, ftMock.member)
// second time around for clamo
  .get('/content/notifications?since=XXX&apiKey=' + ftApiKey)
  .reply(200, ftMock.first)
  .get('/content/notifications?since=XXX&apiKey=' + ftApiKey)
  .reply(200, ftMock.second)
  .get('/content/bd15e610-1b02-11e5-a130-2e7db721f996?apiKey=' + ftApiKey)
  .reply(200, ftMock.clamoArticle);

var something = nock('http://something.com')
  .get('/image.png')
  .times(2)
  .reply(200, 'myfile', {
    'Content-Type': 'image/png'
  });


var s3 = nock('http://com.ft.imagepublish.prod.s3.amazonaws.com')
  .get('/b694f79a-1aee-11e5-8201-cbdb03d71480')
  .reply(200, 'myfile', {
     'Content-Type': 'image/png'
    })
  .get('/ac2da5e8-2c89-11e5-acfb-cbd2e1c81cca')
  .reply(200, 'myfile', {
     'Content-Type': 'image/png'
    });

var stamperURL = process.env.STAMPER_URL;
var stamper = nock(stamperURL)
  .post('/read')
  .times(3)
  .reply(200, [
    {
      "Author": "steve.bernard@ft.com"
    },
    {
      "Software": "Nightingale"
    }
  ]);

var asanaURL = process.env.ASANA_API_URL;
var asana = nock(asanaURL)
  .post('/tasks')
  .reply(200, {"data" : ftMock.task })
  .post('/tasks/someid/attachments')
  .reply(200, "ok");

var slackHOOK = process.env.SLACK_WEB_HOOK;
var slack = nock('https://hooks.slack.com')
  .post('/services/T025C95MN/B08J2RTSR/ALYDNFEEWzCaXm0uRHq4VYfK')
  .reply(200, "ok");
