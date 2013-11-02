var ENML2Markdown = require('../lib/enml2md.js'),
  should = require('should')

describe('ENML2Markdown', function(){
  describe('#notes()', function(){
    it('should return `1` for `fiture1.enex`.', function(done){
      testNotesCount('./test/fixtures/fixture1.enex', 1, done);
    });
    it('should return `2` for `fiture2.enex`.', function(done){
      testNotesCount('./test/fixtures/fixture2.enex', 2, done);
    });
  });
});

function testNotesCount(enml_filename, expect, done) {
  var enml = new ENML2Markdown(enml_filename);
  var count_async = enml.notes();
  count_async.on('done', function(count) {
    count.should.equal(expect);
    done();
  });
}