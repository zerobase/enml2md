(function() {
  var EvernoteExport, Parser, fs, mkdirp;

  fs = require('graceful-fs');

  mkdirp = require('mkdirp');

  Parser = require('./Parser').Parser;

  EvernoteExport = (function() {
    function EvernoteExport(filename) {
      this.filename = filename;
      this.count = 0;
      this.done = false;
    }

    EvernoteExport.prototype["export"] = function(exportDirectory, cbDone) {
      var enex;
      enex = this;
      return mkdirp(this._resourceDirectory(exportDirectory), function(err) {
        var doneProc, eachProc;
        if (err) {
          throw err;
        }
        eachProc = function(note) {
          enex._exportNote(exportDirectory, note);
          return enex._exportAttachments(exportDirectory, note);
        };
        doneProc = function() {
          enex.done = true;
          if (cbDone) {
            return cbDone();
          }
        };
        return enex.each(eachProc, doneProc);
      });
    };

    EvernoteExport.prototype._exportNote = function(exportDirectory, note) {
      var path;
      path = exportDirectory + '/' + note.filename();
      return fs.writeFile(path, note.toString(), function(err) {
        if (err) {
          throw err;
        }
      });
    };

    EvernoteExport.prototype._exportAttachments = function(exportDirectory, note) {
      var enex;
      enex = this;
      return note.attachments.forEach(function(attachment) {
        var path;
        path = enex._exportAttachmentPath(exportDirectory, attachment);
        return fs.writeFile(path, attachment.data, function(err) {
          if (err) {
            throw err;
          }
        });
      });
    };

    EvernoteExport.prototype._resourceDirectory = function(exportDirectory) {
      return exportDirectory + '/resources';
    };

    EvernoteExport.prototype._exportAttachmentPath = function(exportDirectory, attachment) {
      return this._resourceDirectory(exportDirectory) + '/' + '095619d89dbbd6a0c5704d57e444f708' + '.' + 'png';
    };

    EvernoteExport.prototype.each = function(cbEach, cbEnd) {
      var parser;
      parser = new Parser(this, cbEach, cbEnd);
      return parser.parse(this.filename);
    };

    return EvernoteExport;

  })();

  exports.EvernoteExport = EvernoteExport;

}).call(this);
