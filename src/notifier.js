let logger = require('./logger');
let AsanaNotifier = require('./asana');
var slack = require('./slack');

let asanaConfig = {
  ASANA_API_KEY: process.env.ASANA_API_KEY,
  ASANA_API_URL: process.env.ASANA_API_URL,
  ASANA_PROJECT_ID: process.env.ASANA_PROJECT_ID,
  ASANA_WORKSPACE_ID: process.env.ASANA_WORKSPACE_ID
};

let SLACK_WEB_HOOK = process.env.SLACK_WEB_HOOK;

let Notifier = function(_slack, _asana){
  if (_slack){
    slack = _slack;
  }

  if (_asana){
    asana = _asana;
  } else {
    asana = new AsanaNotifier(asanaConfig);
  }

  var getLink = function(task){
    return 'https://app.asana.com/0/' + asanaConfig.ASANA_PROJECT_ID + '/' + task.id;
  }

  this.processArticle = function(article){
    return asana.createTask(article).then(task => {
      return slack.postTask(SLACK_WEB_HOOK, task, getLink(task));
    });
  }
}

module.exports = Notifier;
