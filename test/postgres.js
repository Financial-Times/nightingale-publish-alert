"use strict";

require('dotenv').load();

let sinon = require('sinon');

let PostgresNotifier = require('../src/postgres');

let mockImageMeta = {
  url: 'http://asana.com/image',
  stamps: [
    {
      Author: 'pete@ft'
    }
  ]
};

let connection = {
  client: {
    query: function(queryValues) {
         return Promise.resolve(queryValues);
      }
    }
}

let mockConnection = sinon.mock(connection.client);

let mockClient = {
  connect: function(task){
    return Promise.resolve(connection);
  }
}

let postgresConfig = {
  POSTGRES_URL: 'wkspace'
}

describe('Postgress', function () {
  var postgres = new PostgresNotifier(postgresConfig, mockClient);

  mockConnection.expects("query").withArgs({text: 'INSERT INTO nightingale_chart VALUES ($1, $2, $3)',
     values: ['http://asana.com/url', '2015-07-17T14:05:32.000Z', ['http://asana.com/image']]});

  it('Should insert an attachment.', function(done) {
    postgres.persist(
    {
      url: 'http://asana.com/url',
      images: [
        mockImageMeta
      ],
      publishedDate: '2015-07-17T14:05:32.000Z'
    }).then(resp => {
      done();
    }).catch(err => {
      done(err);
    });
  });

});
