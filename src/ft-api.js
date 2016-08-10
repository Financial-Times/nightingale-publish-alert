"use strict";

let logger = require('./logger');

let plugin = require('superagent-promise-plugin');
let superagent = plugin.patch(require('superagent'));
let moment = require('moment-timezone');
let querystring = require('querystring');
let path = require('path');

function NotificationsApi(_config, _requests){
  let config = _config ? _config : {
    FT_API_URL: process.env.FT_API_URL,
    FT_API_KEY: process.env.FT_API_KEY
  };

  let requests = _requests ? _requests : superagent;

  let nextPage = function(url, notifications) {
    logger.log('debug', url);
    return requests.get(url + '&apiKey=' + config.API_KEY).then(response => {
      if (!response.body.notifications) {
        return notifications;
      } else {
        logger.log('info', 'Got %s notifications', response.body.notifications.length);
        return nextPage (
            response.body.links[0].href,
            notifications.concat(filterOutDeletes(response.body.notifications))
          );
      }
    });
  };

  let filterOutDeletes = function(notifications) {
    return notifications.filter(notification => {
      return path.basename(notification.type) !== 'DELETE';
    });
  };

  let processNotification = function(notification) {
    return fetchArticle(notification)
      .then(checkForPNGs)
      .then(function(stamps) {
        logger.log('verbose', 'Notification processed', notification.id);
        return stamps;
      });
  };

  this.fetchArticle = function(notification) {
    logger.log('verbose', 'Loading article %s', notification.apiUrl);
    return requests.get(notification.apiUrl)
      .query({
          apiKey : config.API_KEY
      }).catch(err => {
        logger.log('error', 'Error getting article %s', notification.apiUrl, {
          error: err.message,
          notification: notification
        });
        throw err;
      }).then(response => {
        if (!response.ok){
          return Promise.reject(new Error('Failed response from the UPP API!'));
        }

        return Promise.resolve(response.body);
      });
  };

  this.getNotifications = function(since) {
    logger.log('info', 'Loading notifications since %s', moment(since).format());
    var queryParams = querystring.stringify({
      since : since.toISOString()
    });

    var reqUrl = config.FT_API_URL + '/content/notifications?' + queryParams;
    return nextPage(reqUrl, []);
  };
}

module.exports = NotificationsApi;
