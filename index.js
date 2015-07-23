require('dotenv').load();

var poller = require('./src/poller');


setInterval(function() {
  poller.poll();
}, 1 * 60 * 1000);

poller.poll();
