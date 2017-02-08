"use strict";

let logger = require('./logger');
let Pgb = require("pg-bluebird");
let QUERY = 'INSERT INTO nightingale_chart VALUES ($1, $2, $3)'

function PostgresNotifier(config){

    this.persist = function(article){
        var pgb = new Pgb();
        logger.log('info', 'Inserting Postgress notification for article %s', article.url);

        return pgb.connect(config.DATABASE_URL)
        .then(connection => insertItem(connection, article))
          .catch( error => {
            logger.log('error', 'Could not insert postgress notification for article %s error: %s', JSON.stringify(article), error);
        });
    }

}

const insertItem = (connection, article) => {
  article.images
    .map(image => { return image.url })
    .forEach(url => connection.client.query({text:QUERY, values: [url,article.url, article.publishedDate]}));
}

module.exports = PostgresNotifier;
