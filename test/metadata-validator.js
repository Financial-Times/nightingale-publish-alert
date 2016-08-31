"use strict";

var checkForMetadataV1 = require('../src/metadata-validator');
var expect = require('chai').expect;

describe('checkForMetadataV1', function () {
  it('Should ignore authors validation for white listed brands', function (done) {
    let article = {
      item: {
        id: "test id",
        title: {title: "some title"},
        location: {uri: "test uri"},
        metadata: {
          primarySection: {term: "test primarySection"},
          primaryTheme: {term: "test primaryTheme"},
          authors: [],
          brand: [
            {
              term: {
                name: "Lex",
                taxonomy: "brand"
              }
            }
          ]
        }
      }
    };
    let result = checkForMetadataV1(article);
    expect(result.hasAuthors).to.equal(false);
    expect(result.hasPrimarySection).to.equal(true);
    expect(result.hasPrimaryTheme).to.equal(true);
    expect(result.validMetadata).to.equal(true);
    done();
  });

  it('Should set validMetadata to false for authors validation for other brands', function (done) {
    let article = {
      item: {
        id: "test id",
        title: {title: "some title"},
        location: {uri: "test uri"},
        metadata: {
          primarySection: {term: "test primarySection"},
          primaryTheme: {term: "test primaryTheme"},
          authors: [],
          brand: [
            {
              term: {
                name: "test brand",
                taxonomy: "brand"
              }
            }
          ]
        }
      }
    };
    let result = checkForMetadataV1(article);
    expect(result.hasAuthors).to.equal(false);
    expect(result.hasPrimarySection).to.equal(true);
    expect(result.hasPrimaryTheme).to.equal(true);
    expect(result.validMetadata).to.equal(false);
    done();
  });

});
