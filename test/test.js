var ENML2Markdown = require('../lib/enml2md.js'),
  should = require('should')

describe('ENML2Markdown', function(){
  describe('#notes()', function(){
    it('should return `1` for `fiture1.enex`.', function(done){
      var enml = new ENML2Markdown('./test/fixtures/fixture1.enex');
      var count_async = enml.notes();
      count_async.on('done', function(count) {
        count.should.equal(1);
        done();
      });
    });
    it('should return `2` for `fiture2.enex`.', function(done){
      var enml = new ENML2Markdown('./test/fixtures/fixture2.enex');
      var count_async = enml.notes();
      count_async.on('done', function(count) {
        count.should.equal(2);
        done();
      });
    });
  })
})