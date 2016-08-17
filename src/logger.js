"use strict";

var winston = require('winston');

module.exports = new (winston.Logger)({
  level: process.env.LEVEL || 'info',
  transports: [
    new (winston.transports.Console)({colorize: true})
  ],
  colors: {
     info: 'blue',
     debug: 'green',
     warn: 'yellow',
     error: 'red'
   }
});
