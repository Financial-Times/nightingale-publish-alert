require('dotenv').load();

let expect = require('chai').expect;
let config = require('./mock-asana-endpoints');

let plugin = require('superagent-promise-plugin');
let request = plugin.patch(require('superagent'));
let superagentMock = require('superagent-mock')(request, config);

let AsanaNotifier = require('../src/asana');

let mockImage = {
  body: 'some image',
  req: {
    path: 'image.png'
  }
};

let mockImageMeta = {
  url: 'http://asana.com/image',
  stamps: [
    {
      Author: 'pete@ft'
    }
  ]
};

let mockTask = {
  id: 'id'
};

let mockClient = {
  tasks: {
    create: function(task){
      console.log(task);
      return Promise.resolve(task);
    }
  }
}

let asanaConfig = {
  ASANA_WORKSPACE_ID: 'wkspace',
  ASANA_PROJECT_ID: 'pjct',
  ASANA_API_KEY: 'key',
  ASANA_API_URL: 'http://asana.com/url'
}

describe('Asana', function () {

  it('Should upload an attachment.', function(done) {
    var asana = new AsanaNotifier(asanaConfig, mockClient, request);

    asana.createTask({
      url: 'http://asana.com/url',
      images: [
        mockImageMeta
      ],
      title: 'title'
    }).then(resp => {
      done();
    }).catch(err => {
      done(err);
    });
  });
});
