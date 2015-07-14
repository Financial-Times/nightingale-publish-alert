require('dotenv').load();
var request = require('superagent');
var Q = require('q');
var cheerio = require('cheerio');
var fs = require('fs');
var http = require('http');


var lastPolled = null;
var ftApiURLRoot = 'http://api.ft.com';
// var stamperUrl = 'http://png-stamper.herokuapp.com';
var stamperUrl = 'http://0.0.0.0:3000';



function getUpdates() {
  // http://api.ft.com/content/notifications?since=2015-07-03&apiKey=dvc53bhjv2nhneqda6xgvjfm

  if (!lastPolled) {
    // start polling three hours ago
    lastPolled = new Date(new Date().getTime() - 3 * 60 * 60 * 1000);
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

  var $ = cheerio.load(articleJSON.bodyXML);

  $('ft-content[type*="/ImageSet"]')
    .each(function(d) {
      imageSetUrls.push(this.attribs.url);
    });

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
        var url = response.body.members[0].id;
        request
          .get(url)
          .query({
              apiKey : process.env.API_KEY
          }).end(function (err, response) {
            if (err) {
              return deferred.reject(err);
            }
            deferred.resolve(response.body.binaryUrl);
          });
      });
    return deferred.promise;
  });

  Q.allSettled(promises).then(function(urls) {
    urls.map(downloadImage);
  });

}

function downloadImage(promise)  {
  if (promise.state !== 'fulfilled') return;
  var url = promise.value;
  var path = require('path');
  var uuid = path.basename(url);
  var filePath = path.join('tmp', uuid + '.png');
  // console.log('loading image from s3:', uuid);
  request
    .get(url)
    .end(function(err, response) {
      if (response.headers['content-type'] !== 'image/png') {
        return;
      }
      console.log('Found a png - looking for stamps');
      var req = http.request({
        hostname: '127.0.0.1',
        port: 3000,
        method: 'POST',
        path: '/read',
        headers: {
          'Content-Type': 'image/png'
        }
      }, function(res) {
        res.on('data', function(err, data) {
          var stamps = JSON.parse(err.toString('utf-8'));
          console.log("Stamps for", url);
          stamps.forEach(function(s) {
            console.log(s);
          });
        });
      });
      req.write(response.body);
      req.end();


      // fs.writeFile(filePath, response.body, function(err) {
      //   if (err) {
      //     console.log('error writing', url);
      //   }
      //
      //   console.log("done writing", url);
      //   request
      //     .post(stamperUrl + '/read')
      //     .set('Content-Type', 'image/png')
      //     .send(response.body)
      //     .end(function(err, response) {
      //       debugger;
      //     });
      // });
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
        return articleJSONs.map(checkForPNGs);
      });

    });
}

poll();
