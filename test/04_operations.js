var should = require('should'),
  fs = require('fs'),
  rootpath = process.cwd() + '/',
  path = require('path'),
  exec = require('child_process').exec,
  libdir = process.env.LIB ? process.env.LIB : 'lib';
  chain = require(rootpath + libdir + '/datachains.js').chain;

describe('[operations]', function () {

  before(function () {});

   describe('#map', function () {
    it('Run chain with map operation', function () {
      chain([1,2,3]).map(function(e){return e=e*e}).toArray().should.eql([1,4,9]);
    });
    it('Run generic chain with map', function () {
      var testChain = chain().map(function(e){return e=e*e}).toArray();
      testChain.process([1,2,3]).should.eql([1,4,9]);
    });
    it('Run compiled chain with map', function () {
      var testChainFunction = chain().map(function(e){return e=e*e}).compile();
      testChainFunction([1,2,3]).should.eql([1,4,9]);
    });
  });  

  describe('#filter', function () {
    it('Run chain with filter from the array', function () {
      chain([1,2,3]).filter(function(e){return e!=2}).toArray().should.eql([1,3]);
    });
    it('Run generic chain with filter', function () {
      var testChain = chain().filter(function(e){return e!=2}).toArray();
      testChain.process([1,2,3]).should.eql([1,3]);
    });
    it('Run compiled chain with filter', function () {
      var testChainFunction = chain().filter(function(e){return e!=2}).compile();
      testChainFunction([1,2,3]).should.eql([1,3]);
    });
  });  

  describe('#reduce', function () {
    it('Run chain with reduce from the array', function () {
      should.strictEqual(
          chain([1,2,3]).reduce(function(acc,value){return acc * value},1), 6);
    });    
    it('Run generic chain with reduce', function () {
      var testChain = chain().reduce(function(acc,value){return acc * value},1);
      should.strictEqual(testChain.process([1,2,3]),6);
    });
    it('Run compiled chain with reduce', function () {
      var testChainFunction =
          chain().reduce(function(acc,value){return acc * value},1).compile();
      should.strictEqual(testChainFunction([1,2,3]),6);
    });
  });

  describe('#forEach', function () {
    it('Run chain from the array', function () {
      var result = [];
      chain([1,2,3]).forEach(function(value){result.push(value)});
      result.should.eql([1,2,3]);
    });
    it('Run generic chain', function () {
      var result = [];
      var testChain = chain().forEach(function(value){result.push(value)});
      testChain.process([1,2,3]);
      result.should.eql([1,2,3]);
    });
    it('Run compiled chain', function () {
      var result = [];
      var testChainFunction = chain()
          .forEach(function(value){result.push(value)}).compile();
      testChainFunction([1,2,3]);
      result.should.eql([1,2,3]);
    });
  });

  describe('#some', function () {
    it('Run chain from the array with some elements match', function () {
      var calls = 0;
      chain([1,2,3,4,5])
          .some(function(value){calls++;return value==4},1)
          .should.be.true;
      calls.should.be.eql(4);
    });    
    it('Run chain from the array with no elements match',function () {
      var calls = 0;
      chain([1,2,3,4,5])
          .some(function(value){calls++;return value==10},1)
          .should.be.false;
      calls.should.be.eql(5);
    });
    it('Run generic chain with no elements match',function () {
      var calls = 0;
      chain()
          .some(function(value){calls++;return value==10},1)
          .process([1,2,3,4,5])
          .should.be.false;
      calls.should.be.eql(5);
    });
    it('Run generic chain with some elements match', function () {
      var calls = 0;
      chain()
          .some(function(value){calls++;return value==4},1)
          .process([1,2,3,4,5])
          .should.be.true;
      calls.should.be.eql(4);
    });    
    it('Run compiled chain with no elements match',function () {
      var calls = 0;
      chain()
          .some(function(value){calls++;return value==10},1)
          .compile()([1,2,3,4,5])
          .should.be.false;
      calls.should.be.eql(5);
    });        
    it('Run compiled chain with some elements match', function () {
      var calls = 0;
      chain()
          .some(function(value){calls++;return value==4},1)
          .compile()([1,2,3,4,5])
          .should.be.true;
      calls.should.be.eql(4);
    });    
  });

  describe('#every', function () {
    it('Run chain from the array with some elements don\'t match', function () {
      var calls = 0;
      chain([1,2,3,4,5])
          .every(function(value){calls++;return value<4},1)
          .should.be.false;
      calls.should.be.eql(4);
    });    
    it('Run chain from the array with all elements match',function () {
      var calls = 0;
      chain([1,2,3,4,5])
          .every(function(value){calls++;return value<10},1)
          .should.be.true;
      calls.should.be.eql(5);
    });
    it('Run generic chain with some elements don\'t match', function () {
      var calls = 0;
      chain()
          .every(function(value){calls++;return value<4},1)
          .process([1,2,3,4,5])
          .should.be.false;
      calls.should.be.eql(4);
    });    
    it('Run generic chain with all elements match',function () {
      var calls = 0;
      chain()
          .every(function(value){calls++;return value<10},1)
          .process([1,2,3,4,5])
          .should.be.true;
      calls.should.be.eql(5);
    });
    it('Run compiled chain with some elements don\'t match', function () {
      var calls = 0;
      chain()
          .every(function(value){calls++;return value<4},1)
          .compile()([1,2,3,4,5])
          .should.be.false;
      calls.should.be.eql(4);
    });    
    it('Run compiled chain with all elements match',function () {
      var calls = 0;
      chain()
          .every(function(value){calls++;return value<10},1)
          .compile()([1,2,3,4,5])
          .should.be.true;
      calls.should.be.eql(5);
    });
  });

  describe('#skip', function () {
    it('Run chain with skip operation', function () {
      chain([1,2,3,4,5]).skip(2).skip(1).toArray().should.eql([4,5]);
    });
    it('Run generic chain with skip operation', function () {
      var testChain = chain().skip(2).skip(1).toArray();
      testChain.process([1,2,3,4,5]).should.eql([4,5]);
    });
    it('Run compiled chain with skip operation', function () {
      var testChainFunction = chain().skip(2).skip(1).compile();
      testChainFunction([1,2,3,4,5]).should.eql([4,5]);
    });
  }); 

  describe('#limit', function () {
    it('Run chain with limit operation', function () {
      chain([1,2,3,4,5]).limit(4).limit(2).toArray().should.eql([1,2]);
    });
    it('Run generic chain with limit operation', function () {
      var testChain = chain().limit(4).limit(2).toArray();
      testChain.process([1,2,3,4,5]).should.eql([1,2]);
    });
    it('Run compiled chain with limit operation', function () {
      var testChainFunction = chain().limit(4).limit(2).compile();
      testChainFunction([1,2,3,4,5]).should.eql([1,2]);
    });
  }); 

  describe('#count', function () {
    it('Run chain with count operation', function () {
      chain([1,2,3,4,5]).count().should.eql(5);
    });
    it('Run generic chain with count operation', function () {
      var testChain = chain().count();
      testChain.process([1,2,3,4,5]).should.eql(5);
    });
    it('Run compiled chain with count operation', function () {
      var testChainFunction = chain().count().compile();
      testChainFunction([1,2,3,4,5]).should.eql(5);
    });
  }); 

  describe('#first', function () {
    it('Run chain with first operation', function () {
      chain([1,2,3,4,5]).first(3).should.eql([1,2,3]);
    });
    it('Run generic chain with first operation', function () {
      var testChain = chain().first(3);
      testChain.process([1,2,3,4,5]).should.eql([1,2,3]);
    });
    it('Run compiled chain with first operation', function () {
      var testChainFunction = chain().first(3).compile();
      testChainFunction([1,2,3,4,5]).should.eql([1,2,3]);
    });
  });

  describe('#last', function () {
    it('Run chain with last operation', function () {
      chain([1,2,3,4,5]).last(3).should.eql([3,4,5]);
      chain([1,2,3,4]).last(2).should.eql([3,4]);
    });
    it('Run generic chain with last operation', function () {
      var testChain = chain().last(2);
      testChain.process([1,2,3,4,5]).should.eql([4,5]);
      testChain.process([1,2,3,4]).should.eql([3,4]);
    });
    it('Run compiled chain with last operation', function () {
      var testChainFunction = chain().last(2).compile();
      testChainFunction([1,2,3,4,5]).should.eql([4,5]);
      testChainFunction([1,2,3,4]).should.eql([3,4]);
    });
  }); 

  after(function () {})


});