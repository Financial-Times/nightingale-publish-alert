"use strict";

let _ = require('underscore');
var logger = require('./logger');

let AUTHORS_ALERTS_EXCLUDE_BRANDS = process.env.AUTHORS_ALERTS_EXCLUDE_BRANDS || "Lex,FT_View";
let excludedBrands = _.map(AUTHORS_ALERTS_EXCLUDE_BRANDS.split(","), function(s){ return s.replace("_", " "); });

function checkForMetadataV1(articleJSON) {

  let primarySection = isNotEmptyObject(articleJSON.item.metadata.primarySection);
  let primaryTheme = isNotEmptyObject(articleJSON.item.metadata.primaryTheme);
  let authors = isNotEmptyArray(articleJSON.item.metadata.authors);
  let brands = extractBrands(articleJSON.item.metadata.brand);
  let validMetadata = primarySection && primaryTheme && areValidAuthors(authors, brands);
  let isBlog = articleJSON.item.aspectSet == "blogPost";
  return {
    id: articleJSON.item.id,
    title: articleJSON.item.title.title,
    webUrl: articleJSON.item.location.uri,
    validMetadata: validMetadata,
    hasPrimarySection: primarySection,
    hasAuthors: authors,
    hasPrimaryTheme: primaryTheme,
    isBlog: isBlog
  };
}

function isNotEmptyArray(property) {
  return property && (property.length > 0)
}

function isNotEmptyObject(property) {
  return !!(property && property['term'])
}

function extractBrands(brands) {
  if (!brands) {
    return []
  }
  return _.map(brands, function (item) {
    return item.term.name;
  });
}

function areValidAuthors(authors, brands) {
  let isExcludedBrands = !!_.find(excludedBrands, function (item) {
    return _.contains(brands, item);
  });
  return isExcludedBrands || authors;
}

module.exports = checkForMetadataV1;
