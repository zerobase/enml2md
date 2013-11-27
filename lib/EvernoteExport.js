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
      return fs.writeFileSync(path, note.toString());
    };

    EvernoteExport.prototype._exportAttachments = function(exportDirectory, note) {
      var attachment, attachmentDirectory, file, hash, resourceDirectory, _ref, _results;
      _ref = note.attachments;
      _results = [];
      for (hash in _ref) {
        attachment = _ref[hash];
        resourceDirectory = this._resourceDirectory(exportDirectory);
        attachmentDirectory = resourceDirectory + '/' + hash;
        file = attachmentDirectory + '/' + attachment.fileName;
        fs.mkdirSync(attachmentDirectory);
        _results.push(fs.writeFileSync(file, attachment.data));
      }
      return _results;
    };

    EvernoteExport.prototype._resourceDirectory = function(exportDirectory) {
      return exportDirectory + '/resources';
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

/*
//@ sourceMappingURL=EvernoteExport.js.map
*/