var cors = require('cors');
var express = require('express');
var app = express();
var logger = require('./src/logger');
var _ = require('underscore');

app.get('/', function (req, res) {
  res.send('Nightingale Publish Alert Service OK!');
});


var Poller = require('./src/poller');
var Notifier = require('./src/notifier');

var poller = new Poller();
var notifier = new Notifier();

var interval = process.env.SEARCH_BACK_MS || 15000;
setInterval(pollForCharts, interval);

function pollForCharts() {
  poller.poll()
  .then(function(articles) {
    filterArticles(articles, {'hasNightingale': true})
      .map(notifier.processArticle);
    filterArticles(articles, function(a) {
      return a['metadata']['validMetadata'] == false;
    }).map(notifier.processMetadata)
  })
  .catch(function(error) {
    logger.log('error', 'Error:', error);
  });

  function filterArticles(articles, predicate) {
    var filteredArticles = _.filter(articles, predicate);
    var predicateMessage = 'nightingale charts';
    if (typeof predicate == "function") {
      predicateMessage = 'invalid metadata';
    }
    logger.log('info', 'Articles with %s : %s', predicateMessage, filteredArticles.length);
    logger.log('info', JSON.stringify(filteredArticles));
    return filteredArticles;
  }
}

pollForCharts();


var server = app.listen(process.env.PORT || 3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  logger.log('info', 'Nightingale Publish Alert health check at http://%s:%s', host, port);

});
