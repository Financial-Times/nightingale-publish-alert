require('dotenv').load();

var cors = require('cors');
var express = require('express');
var app = express();
var logger = require('./src/logger');


app.get('/', function (req, res) {
  res.send('Nightingale Publish Alert Service OK!');
});


var poller = require('./src/poller');

setInterval(function() {
  poller.poll();
}, 1 * 60 * 1000);

poller.poll();



var server = app.listen(process.env.PORT || 3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  logger.log('info', 'Nightingale Publish Alert health check at http://%s:%s', host, port);

});
