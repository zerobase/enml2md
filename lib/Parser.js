(function() {
  var Attachment, Note, Parser, fs, sax;

  fs = require('graceful-fs');

  sax = require('sax');

  Note = require('./Note').Note;

  Attachment = require('./Attachment').Attachment;

  Parser = (function() {
    function Parser(enex, cbEach, cbEnd) {
      var saxParser, strict;
      strict = true;
      this.saxParser = saxParser = sax.parser(strict, {
        trim: false,
        normalize: false
      });
      this.saxParser.ontextHandlers = {
        'title': function(text) {
          return saxParser.note.title = text;
        },
        'created': function(text) {
          return saxParser.note.created = Note.parseENMLDate(text);
        },
        'updated': function(text) {
          return saxParser.note.updated = Note.parseENMLDate(text);
        },
        'tag': function(text) {
          return saxParser.note.tags.push(text);
        },
        'data': function(text) {
          var attachment;
          attachment = new Attachment;
          attachment.loadData(new Buffer(text, 'base64'));
          return saxParser.note.attachments.push(attachment);
        }
      };
      this.saxParser.onopentag = function(node) {
        this.currentElement = node.name;
        if (node.name === 'note') {
          return this.note = new Note;
        }
      };
      this.saxParser.onclosetag = function(nodeName) {
        if (nodeName === 'note') {
          enex.count = enex.count + 1;
          if (cbEach) {
            return cbEach(this.note);
          }
        }
      };
      this.saxParser.ontext = function(text) {
        var handler;
        handler = this.ontextHandlers[this.currentElement];
        if (typeof handler === 'function') {
          return handler(text);
        }
      };
      this.saxParser.oncdata = function(text) {
        return this.cdata = text;
      };
      this.saxParser.onclosecdata = function() {
        return this.note.content = Note.parseENMLContent(this.cdata);
      };
      this.saxParser.onend = function() {
        if (cbEnd) {
          return cbEnd();
        }
      };
    }

    Parser.prototype.parse = function(filename) {
      var saxParser;
      saxParser = this.saxParser;
      return fs.readFile(filename, 'utf8', function(error, file) {
        return saxParser.write(file.toString()).close();
      });
    };

    return Parser;

  })();

  exports.Parser = Parser;

}).call(this);
