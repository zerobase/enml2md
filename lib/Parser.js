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
          note = parser._composeNote($(this));
          if (parser.cbEach) {
            return parser.cbEach(note);
          }
        });
        if (parser.cbEnd) {
          return parser.cbEnd();
        }
      });
    };

    Parser.prototype._composeNote = function($note) {
      var note;
      note = new Note;
      note.title = $note.find('title').text();
      note.created = Note.parseENMLDate($note.find('created').text());
      note.updated = Note.parseENMLDate($note.find('updated').text());
      $note.find('tag').each(function() {
        return note.tags.push(this.text());
      });
      $note.find('resource').each(function() {
        var attachment, data;
        data = new Buffer(this.find('data').text(), 'base64');
        attachment = new Attachment;
        attachment.loadData(data);
        attachment.type = this.find('mime').text();
        attachment.setFileName(this.find('file-name').text());
        return note.pushAttachment(attachment);
      });
      note.loadENMLContent($note.find('content').html());
      return note;
    };

    return Parser;

  })();

  exports.Parser = Parser;

}).call(this);

/*
//@ sourceMappingURL=Parser.js.map
*/