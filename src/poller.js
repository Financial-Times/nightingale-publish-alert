var request = require('superagent');
var Q = require('q');
var logger = require('./logger');
var http = require('http');
var querystring = require('querystring');
var moment = require('moment');
var url = require('url');
var cheerio = require('cheerio');
var _ = require('underscore');
var path = require('path');

var lastPolled = null;
var ftApiURLRoot = process.env.FT_API_URL;
var stamperUrl = process.env.STAMPER_URL;
var stamper = url.parse(stamperUrl);
var API_KEY = process.env.FT_API_KEY;


function getNotifications() {
  var query = {
    since : lastPolled.toISOString()
  };

  var qs = querystring.stringify(query);
  var reqUrl = ftApiURLRoot + '/content/notifications?' + qs;

  var deferred = Q.defer();

  getNotificationsPage(reqUrl, [], deferred);

  return deferred.promise;

}

// memoised recursive function that navigates the links until
// there are no more notifications
function getNotificationsPage(url, notifications, deferred) {
  logger.log('debug', url);
  logger.log('info', 'Loading notifications since %s', moment(lastPolled).format());
  request
    .get(url + '&apiKey='+API_KEY)
    .end(function(err, response) {
      if (err) {
        logger.log('error', 'Error getting notifications', {
          error: err.message
        });
        return deferred.reject(err);
      }

      // we reached the end
      if (!response.body.notifications.length) {
        deferred.resolve(notifications);
      } else {
        logger.log('info', 'Got %s notifications', response.body.notifications.length);
        // continue
        getNotificationsPage(
            response.body.links[0].href,
            notifications.concat(filterOutDeletes(response.body.notifications)),
            deferred
          );
      }

    });

}

function filterOutDeletes(notifications) {
  return _.filter(notifications, function (notification) {
    var type = path.basename(notification.type);
    return type !== 'DELETE';
  });
}

function processNotification(notification) {
  return fetchArticle(notification)
    .then(checkForPNGs)
    .then(function(stamps) {
      logger.log('verbose', 'Notification processed', notification.id);
      return stamps;
    });
}


function fetchArticle(notification) {
  var deferred = Q.defer();
  logger.log('verbose', 'Loading article %s', notification.apiUrl);
  request
    .get(notification.apiUrl)
    .query({
        apiKey : API_KEY
    })
    .end(function (err, response) {
      if (err) {
        logger.log('error', 'Error getting article %s', notification.apiUrl, {
          error: err.message,
          notification: notification
        });
        return deferred.reject(err);
      }
      logger.log('verbose', 'Loaded article %s', notification.apiUrl);
      deferred.resolve(response.body);
    });

  return deferred.promise;

}

function checkForPNGs(articleJSON) {
  // var articleJSON = promise.value;
  var imageSetUrls = [];
  // logger.log('debug', JSON.stringify(articleJSON, null, 2));
  var $ = cheerio.load(articleJSON.bodyXML);

  var imgTagUrls = [];

  $('ft-content[type*="/ImageSet"]')
    .each(function(d) {
      imageSetUrls.push(this.attribs.url);
    });

  $('img')
    .each(function(d) {
      // discard jpegs
      if (/\.jpe?g$/.test(this.attribs.src)) {
        return;
      }

      // no gifs here either duh
      if (/\.gif$/.test(this.attribs.src)) {
        return;
      }

      // we disguise them as "promises" so that they
      // look like what crawlImageSet returns (due to)
      // using allsettled
      imgTagUrls.push({
        state: 'fulfilled',
        value: this.attribs.src
      });
    });

  logger.log('debug', 'Checking article for PNG images');
  var promises = imageSetUrls.map(crawlImageSet);

  return Q.allSettled(promises)
    .then(function(urls) {
      // join the imageSet urls with the plain img tag urls
      urls = urls.concat(imgTagUrls);
      if (!urls.length) {
        return;
      }

      logger.log('verbose', 'All ImageSets crawled, found %s images', urls.length);
      var promises = urls.map(downloadImage);

      return Q.allSettled(promises)
        .then(function(stamps) {
          var procStamps = [];
          stamps.forEach(function(s, i) {
            if (s.state != 'fulfilled') {
              return;
            }

            if (!s.value.length) {
              return;
            }

            var val = s.value;

            var isNightingale = _.findWhere(val, {'Software': 'Nightingale'});


            procStamps.push({
              url: urls[i].value,
              stamps: val,
              isNightingale: !!(isNightingale)
            });
            logger.log('verbose', 'Stamps %j', val, {});
          });

          if (procStamps) {
            logger.log('verbose', 'The article %s contained the following stamps %j', articleJSON.id, procStamps, {});
          } else {
            logger.log('verbose', 'The article %s contained no stamps', articleJSON.id);
          }

          var nightingaleStamp = _.findWhere(procStamps, {isNightingale: true});

          return {
            url: articleJSON.webUrl,
            publishedDate: articleJSON.publishedDate,
            title: articleJSON.title,
            images: procStamps,
            hasNightingale: !!(nightingaleStamp),
            author: nightingaleStamp['stamps'][0]['Author']
          };
      });

  });



}

function crawlImageSet(url) {
  var deferred = Q.defer();
  request
    .get(url)
    .query({
        apiKey : API_KEY
    })
    .end(function (err, response) {
      if (err) {
        logger.log('error', 'Error getting ImageSet %s', url, {
          error: err.message,
          url: url
        });
        return deferred.reject(err);
      }
      imageUrl = response.body.members[0].id;
      request
        .get(imageUrl)
        .query({
            apiKey : API_KEY
        }).end(function (err, response) {
          if (err) {
            logger.log('error', 'Error getting ImageSet Member %s', imageUrl, {
              error: err.message,
              imageUrl: imageUrl
            });
            return deferred.reject(err);
          }
          logger.log('debug', 'Got binary url for ImageSet member %s', imageUrl);
          deferred.resolve(response.body.binaryUrl);
        });
    });
  return deferred.promise;
}

function downloadImage(promise)  {
  if (promise.state !== 'fulfilled') return null;
  if (!promise.value) return null;
  var url = promise.value;
  var path = require('path');
  var uuid = path.basename(url);

  logger.log('debug', 'Downloading image %s from S3', uuid);

  var deferred = Q.defer();

  request
    .get(url)
    .end(function(err, response) {
      if (err) {
        logger.log('error', 'Error downloading image %s from S3', uuid, {
          error: err.message,
          uuid: uuid
        });
        deferred.reject(err);
      }

      if (!response || response.headers['content-type'].indexOf('image/png') === -1) {
        logger.log('debug', 'Image %s is not a PNG - Ignoring', uuid);
        return deferred.reject({error: 'not a png'});
      }
      logger.log('verbose', 'Image %s is a PNG, looking for stamps', uuid);
      var req = http.request({
        hostname: stamper.hostname,
        port: stamper.port,
        method: 'POST',
        path: '/read',
        headers: {
          'Content-Type': 'image/png'
        }
      }, function(res) {
        res.on('data', function(data) {
          var stamps = JSON.parse(data.toString('utf-8'));
          logger.log('debug', 'Loaded %s stamps for %s', stamps.length, uuid, {});
          stamps.forEach(function(s) {
            logger.log('debug', 'Stamp: %j', s, {});
          });
          deferred.resolve(stamps);
        });
        res.on('error', function(error) {
          logger.log('error', 'Error loading stamps for %s', uuid, {
            error: err.message
          });
          deferred.reject(err);
        });
      });
      req.write(response.body);
      req.end();
    });

  return deferred.promise;

}


var Poller = function() {

  this.poll = function() {

    if (!lastPolled) {
      var msBack = process.env.SEARCH_BACK_MS || 15000; // default to 15 seconds
      // start polling three hours ago
      lastPolled = new Date(new Date().getTime() - msBack);
    } else {
      lastPolled = new Date();
    }

    return getNotifications()
      .then(function(notifications) {
        logger.log('verbose', 'Fetching %s articles', notifications.length);
        var promises = notifications.map(processNotification);
        return Q.allSettled(promises);
      })
      .then(function(stamps) {
        logger.log('verbose', 'Stamps found:');
        var foundStamps = _.compact(stamps.map(function(s) {
          if (!s.value) return null;
          if (!s.value.images.length) return null;
          logger.log('verbose', JSON.stringify(s.value, null, 2));
          return s.value;
        }));

        return foundStamps;

      });
  };

};

module.exports = Poller;
