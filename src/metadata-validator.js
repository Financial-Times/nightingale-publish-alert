"use strict";

let _ = require('underscore');
var logger = require('./logger');

let AUTHORS_ALERTS_EXCLUDE_BRANDS = process.env.AUTHORS_ALERTS_EXCLUDE_BRANDS || "Lex,FT_View";
let excludedBrands = _.map(AUTHORS_ALERTS_EXCLUDE_BRANDS.split(","), function(s){ return s.replace("_", " "); });

function checkForMetadataV2(articleJSON) {

  let primarySection = isNotMissing(articleJSON.annotations, 'classification/isPrimarilyClassifiedBy', 'SECTION');
  let primaryTheme = isNotMissing(articleJSON.annotations, 'annotation/about', ['LOCATION', 'ORGANISATION', 'PERSON', 'TOPIC']);
  let authors = isNotMissing(articleJSON.annotations, 'annotation/hasAuthor', 'PERSON');
  let brands = getMetadata(articleJSON.annotations, 'classification/isClassifiedBy', 'BRAND');
  let validMetadata = primarySection && primaryTheme && areValidAuthors(authors, brands);
  return {
    id: articleJSON.id.replace('http://www.ft.com/thing/', ''),
    title: articleJSON.title,
    webUrl: articleJSON.id.replace('thing', 'content'),
    validMetadata: validMetadata,
    hasPrimarySection: primarySection,
    hasAuthors: authors,
    hasPrimaryTheme: primaryTheme
  };
}

const getMetadata = (object, predicate, types) => {
  const node = object.filter( item => item['predicate'] && item['predicate'].includes(predicate) && types.includes(item['type']));
  return node.map((item) => item['prefLabel']);
};

const isNotMissing = (object, predicate, types) => {
  const metadata = getMetadata(object, predicate, types);
  return !!(metadata && metadata.length > 0)
};

function areValidAuthors(authors, brands) {
  let isExcludedBrands = !!_.find(excludedBrands, function (item) {
    return _.contains(brands, item);
  });
  return isExcludedBrands || authors;
}

module.exports = checkForMetadataV2;
