"use strict";

let bluebird = require('bluebird');
let Slack = bluebird.promisifyAll(require('slack-node'));
bluebird.promisifyAll(Slack.prototype);
let logger = require('./logger');
var _ = require('underscore');

let slack = new Slack();

function post(webhook, message){
  slack.setWebhook(webhook);
  return slack.webhookAsync({
    username: 'Nightingale Bot',
    text: message
  });
}

function postTask(webhook, task, link) {
  slack.setWebhook(webhook);
  var message = '<!channel>\nTask: ' + task.name + '\nTo review the chart(s) click the following link: <' + link + '| ' + task.name + '>';
  return slack.webhookAsync({
    username: 'Nightingale Bot',
    text: message
  });
}

function postMetadataTask(webhook, article) {
  slack.setWebhook(webhook);
  var url = article.url || article.metadata.webUrl;
  var title = article.title || article.metadata.title;
  var message = '<!channel>\nArticle: ' + article.metadata.id + '\n <' + url + ' | ' + title + '>\nis missing:';
  if (!article.metadata.hasPrimarySection) {
    message += '\nprimary section';
  }
  if (!article.metadata.hasAuthors) {
    message += '\nauthors';
  }
  if (!article.metadata.hasPrimaryTheme) {
    message += '\nprimary theme';
  }
  return slack.webhookAsync({
    username: 'Article metadata bot',
    text: message,
    icon_emoji: ":newspaper:"
  });
}

module.exports = {
  postTask: postTask,
  postMetadataTask: postMetadataTask,
  post: post
};
