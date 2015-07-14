require('dotenv').load();
var request = require('superagent');
var Q = require('q');
var cheerio = require('cheerio');
var fs = require('fs');
var lastPolled = null;

var ftApiURLRoot = 'http://api.ft.com';

function getUpdates() {
  // http://api.ft.com/content/notifications?since=2015-07-03&apiKey=dvc53bhjv2nhneqda6xgvjfm

  if (!lastPolled) {
    // start polling three hours ago
    lastPolled = new Date(new Date().getTime() - 108e5);
  }

  var deferred = Q.defer();

  request
    .get(ftApiURLRoot + '/content/notifications')
    .query({
      since : lastPolled.toISOString(),
      apiKey : process.env.API_KEY
    })
    .end(function(err, response) {
      if (err) {
        return deferred.reject(err);
      }
      debugger;
      deferred.resolve(response.body.notifications);
    });

  return deferred.promise;
}

function fetchArticle(notification) {
  var deferred = Q.defer();
  request
    .get(notification.apiUrl)
    .query({
        apiKey : process.env.API_KEY
    })
    .end(function (err, response) {
      if (err) {
        return deferred.reject(err);
      }
      deferred.resolve(response.body);
    });

  return deferred.promise;

}

function checkForPNGs(promise) {
  if (promise.state !== 'fulfilled') {
    return [];
  }
  var articleJSON = promise.value;
  var imageSetUrls = [];
  debugger;
  var $ = cheerio.load(articleJSON.bodyXML);

  $('ft-content[type*="/ImageSet"]')
    .each(function(d) {
      imageSetUrls.push(this.attribs.url);
    });
  debugger;
  var promises = imageSetUrls.map(function(url) {
    var deferred = Q.defer();
    request
      .get(url)
      .query({
          apiKey : process.env.API_KEY
      })
      .end(function (err, response) {
        if (err) {
          return deferred.reject(err);
        }
        debugger;
        var url = response.body.members[0].id;
        request
          .get(url)
          .query({
              apiKey : process.env.API_KEY
          }).end(function (err, response) {
            if (err) {
              return deferred.reject(err);
            }
            debugger;
            deferred.resolve(response.body.binaryUrl);
          });
      });
    return deferred.promise;
  });

  Q.allSettled(promises).then(function(urls) {
    debugger;
    urls.map(downloadImage);
  });

}

function downloadImage(promise)  {
  debugger;
  if (promise.state !== 'fulfilled') return;
  var url = promise.value;
  var path = require('path');
  var uuid = path.basename(url);
  var filePath = path.join('tmp', uuid);
  console.log('loading image from s3:', uuid);
  request
    .get(url)
    .end(function(err, response) {
      console.log('done loading');
      fs.writeFile(filePath, response.body, function(err) {
        if (err) {
          console.log('error writing', url);
        }
        console.log("done with", url);
      });
    });
}


function alertAsana() {

}

function findMetadata() {

}

function poll() {
  getUpdates()
    .then(function(updates) {
      var promises = updates.map(fetchArticle);

      Q.allSettled(promises).then(function(articleJSONs) {
        console.log("all articles loaded");
        debugger;
        return articleJSONs.map(checkForPNGs);
      });

    });
}

poll();
