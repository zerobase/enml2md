(function() {
  var Attachment, Note, Parser, cheerio, fs;

  fs = require('graceful-fs');

  cheerio = require('cheerio');

  Note = require('./Note').Note;

  Attachment = require('./Attachment').Attachment;

  Parser = (function() {
    function Parser(enex, cbEach, cbEnd) {
      this.enex = enex;
      this.cbEach = cbEach;
      this.cbEnd = cbEnd;
    }

    Parser.prototype.parse = function(filename) {
      var parser;
      parser = this;
      return fs.readFile(filename, 'utf8', function(error, fileContent) {
        var $;
        $ = cheerio.load(fileContent);
        $('note').each(function() {
          var note;
          parser.enex.count += 1;
          note = Note.composeNoteWithCheerio($(this));
          if (parser.cbEach) {
            return parser.cbEach(note);
          }
        });
        if (parser.cbEnd) {
          return parser.cbEnd();
        }
      });
    };

    return Parser;

  })();

  exports.Parser = Parser;

}).call(this);

/*
//@ sourceMappingURL=Parser.js.map
*/