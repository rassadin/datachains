var should = require('should'),
  fs = require('fs'),
  rootpath = process.cwd() + '/',
  path = require('path'),
  exec = require('child_process').exec,
  libdir = process.env.LIB ? process.env.LIB : 'lib';
  chain = require(rootpath + libdir + '/datachains.js').chain;

describe('chainFunction', function () {

  before(function () {});

  describe('#call', function () {
    
    it('Create chain from the array', function () {
      var testChain = chain([1,2,3]);
      testChain.should.be.type('object');
      testChain.should.have.property('toArray');
      testChain.toArray.should.be.type('function');
      testChain.toArray.length.should.eql(0);
    });
    
    it('Create generic chain', function () {
      var testChain = chain();
      testChain.should.be.type('object');
      testChain.should.have.property('process');
      testChain.process.should.be.type('function');
      testChain.process.length.should.eql(1);
    });

    it('Throw error when passing string', function () {
      (function(){
        chain("string")
      }).should.throw('Wrong argument')
    });

    it('Throw error when passing number', function () {
      (function(){
        chain(42)
      }).should.throw('Wrong argument')
    });

    it('Throw error when passing non-array object', function () {
      (function(){
        chain({0:'a',1:'b'})
    }).should.throw('Wrong argument')

    });

  });
  
  after(function () {})

 });