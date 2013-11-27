(function() {
  var Attachment, TestConfig, fs, should, util;

  TestConfig = require("./TestConfig");

  Attachment = require('../lib/Attachment').Attachment;

  should = require('should');

  util = require('util');

  fs = require('fs');

  describe('Attachment', function() {
    var attachment;
    attachment = new Attachment;
    describe('#setFileName(fileName)', function() {
      return it('sets @extentions', function() {
        attachment.setFileName('a.b.c.jpg');
        attachment.fileName.should.equal('a.b.c.jpg');
        return attachment.extention.should.equal('jpg');
      });
    });
    return describe('#exportFileName()', function() {
      return it('returns "{{hash}}.{{extention}}" filename', function() {
        var pngImage;
        pngImage = fs.readFileSync(TestConfig.fixtures['pngImage']);
        attachment.setFileName('a.b.c.jpg');
        attachment.loadData(pngImage);
        return attachment.exportFileName().should.equal('095619d89dbbd6a0c5704d57e444f708/a.b.c.jpg');
      });
    });
  });

}).call(this);

/*
//@ sourceMappingURL=AttachmentTest.js.map
*/