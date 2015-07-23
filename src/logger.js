var winston = require('winston');

module.exports = new (winston.Logger)({
  level: 'info',
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
