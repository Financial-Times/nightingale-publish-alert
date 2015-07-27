var asana = require('asana');
var path = require('path');
var request = require('superagent');
var Q = require('q');
var uuid = require('uuid');
var https = require('https');
var url = require('url');

var logger = require('./logger');

var ASANA_API_KEY = process.env.ASANA_API_KEY;
var ASANA_API_URL = process.env.ASANA_API_URL;
var ASANA_PROJECT_ID = process.env.ASANA_PROJECT_ID;
var ASANA_WORKSPACE_ID = process.env.ASANA_WORKSPACE_ID;

var tmp = '.tmp';


function getFile(url) {
  var deferred = Q.defer();

  request.get(url)
    .end(function(err, response) {
      if (err) {
        deferred.reject(err);
      }
      deferred.resolve(response);
    });

  return deferred.promise;
}

function uploadAttachment(image, task) {
  // var boundary = '----ArtisanalBoundary' + uuid.v4();
  var boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  var nl = "\r\n";
  var filename = path.basename(image.req.path) + '.png';

  // create a post body with boundaries etc
  var postHead = new Buffer(
    '--' + boundary + nl +
    'Content-Disposition: form-data; name="file"; filename="' + filename + '"' + nl +
    'Content-Type: image/png' + nl +
    nl
  );

  var postFoot = new Buffer(nl +
    '--' + boundary + '--'
  );

  var totalLength = postHead.length + image.body.length + postFoot.length;

  var apiurl = url.parse(ASANA_API_URL);

  // headers
  var headers = {
    'Authorization': 'Basic ' + new Buffer(ASANA_API_KEY + ':').toString('base64'),
    'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
    'Content-Length': totalLength,
    'Host': 'app.asana.com',
    'Cache-Control' : 'no-cache',
    'Accept' : '*/*',
    'Connection': 'keep-alive'
  };

  var options =  {
    hostname: apiurl.hostname,
    port: 443,
    path: apiurl.pathname + '/tasks/' + task.id + '/attachments',
    method: 'POST',
    headers: headers
  };

  // logger.log('info', 'Post Body: %s', postBody, {});
  logger.log('debug', 'Post Options: %s', JSON.stringify(options, null, 2));
  logger.log('debug', 'Post Body length: %s', totalLength, {});

  var deferred = Q.defer();

  var responseBody = '';
  var request = https.request(options, function(response) {

    logger.log('debug', JSON.stringify(response.headers, null, 2));

    response.on('data', function(chunk) {
      responseBody += chunk;
    });

    response.on('end', function() {
      deferred.resolve(responseBody);
    });

  });

  request.on('error', function(e) {
    logger.log('error', e);
    deferred.reject(e);
  });

  request.write(postHead);
  request.write(image.body);
  request.write(postFoot);

  request.end();

  return deferred.promise;
}



var Notifier = function() {

  var client = asana.Client.create()
    .useBasicAuth(ASANA_API_KEY);

  this.addTask = function(article) {
    logger.log('info', 'Adding Asana notification for article %s', article.url);
    return client.tasks.create({
      workspace: ASANA_WORKSPACE_ID,
      projects: [ASANA_PROJECT_ID],
      name : 'Charts on article "' + article.title + '"',
      notes : article.url,
    }).then(function(task) {
      var proms = article.images.map(function(image) {
        return getFile(image.url)
          .then(function(image) {
            logger.log('verbose', 'uploading attachment to task %s', task.id, {});
            return uploadAttachment(image, task);
          })
          .then(function(resp) {
            logger.log('debug', resp);
            return resp;
          }, function(err) {
            logger.log('error', err);
          });
      });

      return Q.all(proms)
        .then(function() {
          return task;
        });

    });
  };

};


module.exports = Notifier;
