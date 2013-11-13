var should = require('should'),
  fs = require('fs'),
  rootpath = process.cwd() + '/',
  path = require('path'),
  exec = require('child_process').exec,
  libdir = process.env.LIB ? process.env.LIB : 'lib';
  chain = require(rootpath + libdir + '/datachains.js').chain;

describe('GenericChain', function () {

  before(function () {});
 
  describe('#process', function () {
    it('Run zero-ops chain', function () {
      var testChain = chain();
      testChain.process([1,2,3]).should.eql([1,2,3]);
    });
    it('Run identity chain', function () {
        var testChain = chain();
        var calls = 0;
        for(var i=0; i< 100; i++) {
          testChain =  testChain.link(
            function(emit) {
              return function(e, context) {
                emit(e, context)
                calls++;
              }
            });
        }
        testChain.process([1,2,3]).should.eql([1,2,3]);
        calls.should.eql(300);
    });
    it('Run simple reduction chain', function () {
        var testChain = chain().end(
          function(e, context) {
            context.result =
                context.result * e;
          },      
          function(context) {
            context.result = 1;
          }
        );
        testChain.process([1,2,3]).should.eql(6);
    });
  });
    
  describe('#toArray', function () {
    it('Run zero-ops chain', function () {
      var testChain = chain().toArray();
      testChain.process([1,2,3]).should.eql([1,2,3]);
    });
    it('Run identity chain', function () {
        var testChain = chain();
        var calls = 0;
        for(var i=0; i< 100; i++) {
         testChain = testChain.link(
            function(emit) {
              return function(e, context) {
                emit(e, context)
                calls++;
              }
            });
        }
        testChain = testChain.toArray();
        testChain.process([1,2,3]).should.eql([1,2,3]);
        calls.should.eql(300);
    });
  });  
  
  describe('#map', function () {
    it('Run map operation chain', function () {
      var testChain = chain().map(function(e){return e=e*e}).toArray();
      testChain.process([1,2,3]).should.eql([1,4,9]);
    }); 
  }); 


  describe('#filter', function () {
    it('Run filter operation chain', function () {
      var testChain = chain().filter(function(e){return e!=2}).toArray();
      testChain.process([1,2,3]).should.eql([1,3]);
    });
  });  

  describe('#reduce', function () {
    it('Run reduce operation chain', function () {
      var testChain = chain().reduce(function(acc,value){return acc * value},1);
      should.strictEqual(testChain.process([1,2,3]),6);
    });
  });

  describe('#compile', function () {
    it('Compile to working function', function () {
      var testChain = chain()
        .map(function(e){return e=e*e})
        .filter(function(e){return e!=4})
        .reduce(function(acc,value){return acc + value},0);
      var compiled = testChain.compile();
      compiled.should.be.type('function');
      compiled.length.should.eql(1);
      compiled([1,2,3]).should.eql(10);
    });
  });

  after(function () {})

});