var should = require('should'),
  fs = require('fs'),
  rootpath = process.cwd() + '/',
  path = require('path'),
  exec = require('child_process').exec,
  libdir = process.env.LIB ? process.env.LIB : 'lib';
  chain = require(rootpath + libdir + '/datachains.js').chain;

describe('Chain', function () {

  before(function () {});

  describe('#toArray', function () {
    it('Run zero-ops chain', function () {
      var testChain = chain([1,2,3]);
      testChain.toArray().should.eql([1,2,3]);
    });
    it('Run identity chain', function () {
        var testChain = chain([1,2,3]);
        var calls = 0;
        for(var i=0; i< 100; i++) {
         testChain = testChain.link(
            function(emit, context) {
              return function(e) {
                emit(e, context)
                calls++;
              }
            });
        }
        testChain.toArray().should.eql([1,2,3]);
        calls.should.eql(300);
    });
    it('Run simple reduction chain', function () {
        var testChain = chain([1,2,3]).end(
          function(e, context) {
            context.result =
                context.result * e;
          },      
          function(context) {
            context.result = 1;
          }
        );
        testChain.should.eql(6);
    });

  });

   describe('#map', function () {
    it('Run map operation chain', function () {
      chain([1,2,3]).map(function(e){return e*e}).toArray().should.eql([1,4,9]);
    });
  });  

  describe('#filter', function () {
    it('Run filter operation chain', function () {
      chain([1,2,3]).filter(function(e){return e!=2}).toArray().should.eql([1,3]);
    });
  });  

  describe('#reduce', function () {
    it('Run reduce operation chain', function () {
      should.strictEqual(
          chain([1,2,3]).reduce(function(acc,value){return acc * value},1), 6);
    });
  });

  describe('<chaining>', function () {
    it('Run map-filter-toArray chain', function () {
      chain([1,2,3])
          .map(function(e){return e*e})
          .filter(function(e){return e!=4})
          .toArray().should.eql([1,9]);
    });
    it('Run map-filter-reduce chain', function () {
      chain([1,2,3])
          .map(function(e){return e*e})
          .filter(function(e){return e!=4})
          .reduce(function(acc,value){return acc + value},0)
          .should.eql(10);
    });
  });    

  after(function () {})

});