let logger = require('./logger');

let plugin = require('superagent-promise-plugin');
let superagent = plugin.patch(require('superagent'));

var asana = require('asana');

let path = require('path');
let Promises = require('bluebird');

function AsanaNotifier(config, _asanaClient, _request){
  var request = _request ? _request : superagent;
  var asanaClient = _asanaClient ? _asanaClient : asana.Client.create().useBasicAuth(config.ASANA_API_KEY);

  var getFilename = function(image, imageMetaData){
    var author = 'unknown';
    try {
      author = imageMetaData.stamps[0].Author.split('@')[0];
    } catch(exception) {
      logger.log('error', 'Could not extract author for image ' + imageMetaData.url);
    }

    var suffix = '.png';
    if (image.req.path.indexOf('.png') > -1) {
      suffix = '';
    }

    return author + ' - ' + path.basename(image.req.path) + suffix;
  }

  var uploadAttachment = function(task, image, imageMetaData){
    var boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    var nl = "\r\n";

    var filename = getFilename(image, imageMetaData);

    logger.log('verbose', 'uploading file %s', filename, {});

    var postHead = new Buffer (
      '--' + boundary + nl +
      'Content-Disposition: form-data; name="file"; filename="' + filename + '"' + nl +
      'Content-Type: image/png' + nl + nl
    );

    var postFoot = new Buffer(nl + '--' + boundary + '--');
    var totalLength = postHead.length + image.body.length + postFoot.length;

    var req = request.post(config.ASANA_API_URL + '/tasks/' + task.id + '/attachments')
           .set('Authorization', 'Basic ' + new Buffer(config.ASANA_API_KEY + ':').toString('base64'))
           .set('Content-Type', 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW')
           .set('Content-Length', totalLength)
           .set('Cache-Control', 'no-cache')
           .set('Connection', 'keep-alive');

    req.write(postHead);
    req.write(image.body);
    req.write(postFoot);

    return req;
  }

  this.createTask = function(article){
    logger.log('info', 'Adding Asana notification for article %s', article.url);
    return asanaClient.tasks.create({
      workspace: config.ASANA_WORKSPACE_ID,
      projects: [config.ASANA_PROJECT_ID],
      name : 'Nightingale chart published in article "' + article.title + '"',
      notes : article.url
    }).then(task => {
      var promises = article.images
             .map(meta => {
               return request.get(meta.url).then(image => {
                 return uploadAttachment(task, image, meta);
               });
             });
      return Promises.all(promises).then(results => {
        return Promise.resolve(task);
      });
    });
  }
}

module.exports = AsanaNotifier;
