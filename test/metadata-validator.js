"use strict";

var checkForMetadataV2 = require('../src/metadata-validator');
var expect = require('chai').expect;

describe('checkForMetadataV2',function () {
  it('Should ignore authors validation for white listed brands',function (done) {
    let article ={
      id: "http://www.ft.com/thing/test id",
      title: {title: "some title"},
      location: {uri: "test uri"},
      annotations: [
        {
          "predicate": "http://www.ft.com/ontology/annotation/about",
          "prefLabel": "the person topic",
          "type": "PERSON",
        },
        {
          "predicate": "http://www.ft.com/ontology/annotation/about",
          "prefLabel": "the topic",
          "type": "TOPIC",
        },
        {
          "predicate": "http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy",
          "prefLabel": "the section",
          "type": "SECTION",
        },
        {
          "predicate": "http://www.ft.com/ontology/classification/isClassifiedBy",
          "prefLabel": "FT View",
          "type": "BRAND",
        },
      ]
    };
    let result = checkForMetadataV2(article);
    expect(result.hasAuthors).to.equal(false);
    expect(result.hasPrimarySection).to.equal(true);
    expect(result.hasPrimaryTheme).to.equal(true);
    expect(result.validMetadata).to.equal(true);
    done();
  });

  it('Should set validMetadata to false for authors validation for other brands',function (done) {
    let article ={
      id: "http://www.ft.com/thing/test id",
      title: {title: "some title"},
      location: {uri: "test uri"},
      annotations: [
        {
          "predicate": "http://www.ft.com/ontology/annotation/about",
          "prefLabel": "the person topic",
          "type": "PERSON",
        },
        {
          "predicate": "http://www.ft.com/ontology/annotation/about",
          "prefLabel": "the topic",
          "type": "TOPIC",
        },
        {
          "predicate": "http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy",
          "prefLabel": "the section",
          "type": "SECTION",
        },
        {
          "predicate": "http://www.ft.com/ontology/classification/isClassifiedBy",
          "prefLabel": "the section",
          "type": "Brand",
        },
      ]
    };
    let result = checkForMetadataV2(article);
    expect(result.hasAuthors).to.equal(false);
    expect(result.hasPrimarySection).to.equal(true);
    expect(result.hasPrimaryTheme).to.equal(true);
    expect(result.validMetadata).to.equal(false);
    done();
  });

});
