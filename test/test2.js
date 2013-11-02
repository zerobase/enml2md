// another test example

var example = require('../lib/example.js'),
  should = require('should')

describe('example - Synchronous code', function(){
  describe('#add()', function(){
    it('should return \'a + b\' when the values are \'a\' and \'b\'.', function(){
      example.add(1, 2).should.equal(3);
      example.add(2, 3).should.equal(5);
    })
  })
})