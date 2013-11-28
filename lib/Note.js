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

    Note.prototype.filename = function(extension) {
      var filename;
      filename = this.title.replace(/[\/:]/g, ' ');
      extension = extension || '.md';
      return filename + extension;
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
      var $, note;
      note = this;
      this.original_content = note_content;
      note_content = note_content.replace(/<\?xml[^>]*>\s*/g, '').replace(/<!(--)?\[CDATA[^>]*>\s*/g, '').replace(/<!DOCTYPE[^>]*>\s*/g, '').replace(/<en-note[^>]*>\s*/g, '').replace(/<\/en-note>\s*/g, '').replace(/]](--)?>\s*/g, '');
      $ = cheerio.load(note_content);
      $('en-media').each(function() {
        var fileName, hash, type;
        hash = $(this).attr('hash');
        type = $(this).attr('type');
        fileName = note.attachments[hash].fileName;
        if (type.substr(0, 5) === 'image') {
          return $(this).replaceWith("<img alt=\"" + type + "\" src=\"resources/" + hash + "/" + fileName + "\"/>");
        } else {
          return $(this).replaceWith("<a href=\"resources/" + hash + "/" + fileName + "\">" + fileName + "</a>");
        }
      });
      return this.content = html2markdown($.html());
    };

    return Note;

  })();

  Note.parse = function(enml_note) {
    var $, note;
    $ = cheerio.load(enml_note);
    note = Note.composeNoteWithCheerio($('note'));
    return note;
  };

  Note.composeNoteWithCheerio = function($note) {
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