"use strict";

let bluebird = require('bluebird');
let Slack = bluebird.promisifyAll(require('slack-node'));
bluebird.promisifyAll(Slack.prototype);
let logger = require('./logger');

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

module.exports = {
  postTask: postTask,
  post: post
}
