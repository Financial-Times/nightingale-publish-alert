"use strict";

let logger = require('./logger');
let Pgb = require("pg-bluebird");
let QUERY = 'INSERT INTO nightingale_chart VALUES ($1, $2, $3)';
let cnn;

function PostgresNotifier(config){

    this.persist = function(article){
        var pgb = new Pgb();
        logger.log('info', 'Inserting Postgress notification for article %s', article.url);

        return pgb.connect(config.DATABASE_URL)
        .then(connection => {
          cnn = connection
          insertItem(cnn, article)
        })
          .finally(() => cnn.done())
          .catch( error => {
            logger.log('error', 'Could not insert postgress notification for article %s error: %s', JSON.stringify(article), error);
        });
    }

    this.queryDB = function(startdate, enddate) {
      var pgb = new Pgb();
      return pgb.connect(config.DATABASE_URL)
        .then(connection => {
          cnn = connection
          return cnn.client.query({text: "select to_char(publish_date, 'Mon-YYYY') AS Month, count(distinct image_id) as \"charts published\"from nightingale_chart where publish_date BETWEEN $1 AND $2 group by 1 order by 1 desc", values: [startdate, enddate]})
        })
        .finally(() => cnn.done())
        .catch( error => {
          logger.log('error', 'error querying database %s', error);
        });
    }

}

const insertItem = (connection, article) => {
  article.images
    .map(image => { return image.url })
    .forEach(url => connection.client.query({text:QUERY, values: [url,article.url, article.publishedDate]}));
}

module.exports = PostgresNotifier;
