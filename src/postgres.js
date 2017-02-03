"use strict";

let logger = require('./logger');

function PostgresNotifier(config, _pgClient){

    var pgb = _pgClient ? _pgClient : require("pg-bluebird");

    this.insertItem = function(article){
        logger.log('info', 'Inserting Postgress notification for article %s', article.url);
        var imageLinks = article.images
                        .map(image => { return image.url });
        return pgb.connect(config.POSTGRES_URL)
        .then(connection => {
          return connection.client.query({text: 'INSERT INTO nightingale_chart VALUES ($1, $2, $3)',
                 values:[article.url, article.publishedDate, imageLinks]});
        }).catch( error => {
            logger.log('error', 'Could not insert postgress notification for article %s error: %s', article.url, error);
        });
    }
}

module.exports = PostgresNotifier;