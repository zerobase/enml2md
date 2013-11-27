(function() {
  var Attachment, Note, cheerio, html2markdown;

  cheerio = require('cheerio');

  html2markdown = require('html2markdown');

  Attachment = require('./Attachment').Attachment;

  Note = (function() {
    function Note() {
      this.title = null;
      this.created = null;
      this.updated = null;
      this.tags = [];
      this.content = null;
      this.original_content = null;
      this.attachments = {};
      this.attachmentsLength = 0;
    }

    Note.prototype.filename = function(extention) {
      var filename;
      filename = this.title.replace(/[\/:]/g, ' ');
      extention = extention || '.md';
      return filename + extention;
    };

    Note.prototype.toString = function() {
      var markdown;
      markdown = '';
      markdown += 'Title: ' + this.title + '\n';
      if (this.tags.length > 0) {
        markdown += 'Tag:';
        this.tags.forEach(function(tag) {
          return markdown += ' ' + tag;
        });
        markdown += '\n';
      }
      markdown += '\n' + this.content;
      return markdown;
    };

    Note.prototype.pushAttachment = function(attachment) {
      if (!attachment.hash) {
        throw "hash is not set for attachment";
      }
      this.attachments[attachment.hash] = attachment;
      return this.attachmentsLength += 1;
    };

    Note.prototype.loadENMLContent = function(note_content) {
      var note;
      note = this;
      this.original_content = note_content;
      note_content = note_content.replace(/<\?xml[^>]*>\s*/g, '').replace(/<!(--)?\[CDATA[^>]*>\s*/g, '').replace(/<!DOCTYPE[^>]*>\s*/g, '').replace(/<en-note[^>]*>\s*/g, '').replace(/<\/en-note>\s*/g, '').replace(/]](--)?>\s*/g, '').replace(/<en-media[^>]*?type="(\w+)\/([^"]+)"[^>]*?hash="(\w+)"[^>]*?\/>/g, function(match, type, subtype, hash) {
        var f;
        f = note.attachments[hash].fileName;
        if (type === 'image') {
          return "<img alt=\"" + subtype + " image\" src=\"resources/" + hash + "/" + f + "\"/>";
        } else {
          return "<a href=\"resources/" + hash + "/" + f + "\">" + f + "</a>";
        }
      });
      return this.content = html2markdown(note_content);
    };

    return Note;

  })();

  Note.parse = function(enml_note) {
    var $, note;
    $ = cheerio.load(enml_note);
    note = Note.withCheerio($);
    return note;
  };

  Note.withCheerio = function($) {
    var note;
    note = new Note;
    note.title = $('title').text();
    note.created = Note.parseENMLDate($('created').text());
    note.updated = Note.parseENMLDate($('updated').text());
    $('tag').each(function(index) {
      return note.tags[index] = $(this).text();
    });
    $('resource').each(function(index) {
      var attachment;
      attachment = new Attachment;
      attachment.loadData(new Buffer($(this).find('data').text(), 'base64'));
      note.pushAttachment(attachment);
      return attachment.setFileName($(this).find('file-name').text());
    });
    note.loadENMLContent($('content').html());
    return note;
  };

  Note.parseENMLDate = function(string) {
    var day, hours, minutes, month, offset, seconds, year;
    year = parseInt(string.substr(0, 4));
    month = parseInt(string.substr(4, 2));
    day = parseInt(string.substr(6, 2));
    hours = parseInt(string.substr(9, 2));
    minutes = parseInt(string.substr(11, 2));
    seconds = parseInt(string.substr(13, 2));
    offset = new Date().getTimezoneOffset();
    return new Date(year, month - 1, day, hours, minutes - offset, seconds);
  };

  exports.Note = Note;

}).call(this);

/*
//@ sourceMappingURL=Note.js.map
*/