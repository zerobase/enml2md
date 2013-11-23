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
      this.attachments = [];
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
    note.content = Note.parseENMLContent($('content').html());
    $('data').each(function(index) {
      var attachment;
      attachment = new Attachment;
      attachment.loadData(new Buffer($(this).text(), 'base64'));
      return note.attachments[index] = attachment;
    });
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

  Note.parseENMLContent = function(note_content) {
    note_content = note_content.replace(/<\?xml[^>]*>\s*/g, '').replace(/<!(--)?\[CDATA[^>]*>\s*/g, '').replace(/<!DOCTYPE[^>]*>\s*/g, '').replace(/<en-note[^>]*>\s*/g, '').replace(/<\/en-note>\s*/g, '').replace(/]](--)?>\s*/g, '').replace(/<en-media type="image\/(png|jpg|gif)" hash="(\w+)"\/>/g, '<img alt="$1 image" src="resources/$2.$1"/>').replace(/<en-media type="([^"]+)" hash="(\w+)"\/>/g, '<a href="resources/$2">atattchment: $2 ($1)</a>');
    return html2markdown(note_content);
  };

  exports.Note = Note;

}).call(this);
