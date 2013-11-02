var ENML2Markdown = require('../lib/enml2md.js'),
  should = require('should')

describe('ENML2Markdown', function(){
  describe('#notes()', function(){
    it('should return `2` for `fiture2.enex`.', function(){
      var enml = new ENML2Markdown('fixtures/fixture2.enex');
      enml.notes().should.equal(2);
    });
  })
})