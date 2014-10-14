(function() {
  var EvernoteExport, Parser, fs, mkdirp, path;

  fs = require('graceful-fs');

  path = require('path');

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

    EvernoteExport.prototype._uniqueFilename = function(filename) {
      var buildFilename, i;
      buildFilename = function() {
        return filename + (i === 0 ? "" : " (" + i + ")");
      };
      i = 0;
      while (fs.existsSync(buildFilename())) {
        i += 1;
      }
      return buildFilename();
    };

    EvernoteExport.prototype._exportNote = function(exportDirectory, note) {
      var notePath;
      notePath = this._uniqueFilename(exportDirectory + '/' + note.filename());
      fs.writeFileSync(notePath, note.toString());
      return fs.utimesSync(notePath, note.updated, note.created);
    };

    EvernoteExport.prototype._exportAttachments = function(exportDirectory, note) {
      var attachment, dirPath, filePath, hash, resourceDirectory, _ref, _results;
      _ref = note.attachments;
      _results = [];
      for (hash in _ref) {
        attachment = _ref[hash];
        resourceDirectory = this._resourceDirectory(exportDirectory);
        filePath = resourceDirectory + '/' + attachment.exportFileName();
        dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath);
        }
        if (!fs.existsSync(filePath)) {
          _results.push(fs.writeFileSync(filePath, attachment.data));
        } else {
          _results.push(void 0);
        }
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