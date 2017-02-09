"use strict";

let AsanaNotifier = require('./asana');
var slack = require('./slack');
var PostgresNotifier = require('./postgres');

let asanaConfig = {
  ASANA_API_KEY: process.env.ASANA_API_KEY,
  ASANA_API_URL: process.env.ASANA_API_URL,
  ASANA_PROJECT_ID: process.env.ASANA_PROJECT_ID,
  ASANA_WORKSPACE_ID: process.env.ASANA_WORKSPACE_ID
};

let postgresConfig= {
  DATABASE_URL: process.env.DATABASE_URL
}

let SLACK_WEB_HOOK = process.env.SLACK_WEB_HOOK;
let SLACK_METADATA_WEB_HOOK = process.env.SLACK_METADATA_WEB_HOOK;
let PROCESS_BLOGS = process.env.PROCESS_BLOGS;

let Notifier = function(_slack, _asana, _postgres){
  if (_slack){
    slack = _slack;
  }

  var asana = _asana ? _asana : new AsanaNotifier(asanaConfig);
  var postgres = _postgres ? _postgres : new PostgresNotifier(postgresConfig);

  var getLink = function(task){
    return 'https://app.asana.com/0/' + asanaConfig.ASANA_PROJECT_ID + '/' + task.id;
  };

  this.processArticle = function(article){
    return asana.createTask(article).then(task => {
      return slack.postTask(SLACK_WEB_HOOK, task, getLink(task));
    });
  };

  this.persistArticle = (article) => {
    return postgres.persist(article);
  }

  this.queryDB = (startdate, enddate) => {
    return postgres.queryDB(startdate, enddate)
      .then(result => { return new Promise((res) => {
        if (result){
          res(result.rows)
        }
        res({})
      })});
  }

  this.processMetadata = function (article) {
    if (PROCESS_BLOGS==true || article.metadata.isBlog==false) {
      return slack.postMetadataTask(SLACK_METADATA_WEB_HOOK, article);
    }
    else
      return null;
  }
};

module.exports = Notifier;
