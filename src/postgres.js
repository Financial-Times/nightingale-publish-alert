"use strict";

let logger = require('./logger');
let Pgb = require("pg-bluebird");

function PostgresNotifier(config){

    this.insertItem = function(article){
        var pgb = new Pgb();
        logger.log('info', 'Inserting Postgress notification for article %s', article.url);

        return pgb.connect(config.DATABASE_URL)
        .then(connection => {
          article.images
            .map(image => { return image.url })
            .forEach(url => connection.client.query({text:'INSERT INTO nightingale_chart VALUES ($1, $2, $3)', values: [url,article.url, article.publishedDate]}));
          // return connection.client.query('INSERT INTO nightingale_chart VALUES ($1, $2, $3)', articles);
        }).catch( error => {
            logger.log('error', 'Could not insert postgress notification for article %s error: %s', JSON.stringify(article), error);
        });
    }
}

module.exports = PostgresNotifier;
