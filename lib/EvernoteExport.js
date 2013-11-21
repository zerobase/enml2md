var fs = require('graceful-fs'),
  mkdirp = require('mkdirp'),
  Parser = require('./Parser').Parser

var EvernoteExport = function(filename) {
  
  this.filename = filename
  this.count = 0
  this.done = false
  
  this.export = function (exportDirectory, cbDone) {
    var enex = this
    var done = function () {
      enex.done = true
      if (cbDone) cbDone()
    }
    mkdirp(this._resourceDirectory(exportDirectory), function (err) {
      // make export directory (foo) and resource directory (foo/resources) at the same time
      if (err) throw err
      enex.each(function (note) {
        enex._exportNote(exportDirectory, note)
        enex._exportAttachments(exportDirectory, note)
      }, done)
    })
  }
  
  this._exportNote = function (exportDirectory, note) {
    var path = exportDirectory + '/' + note.filename()
    fs.writeFile(path, note.toString(), function (err) {
      if (err) throw err
    })
  }

  this._exportAttachments = function (exportDirectory, note) {
    var enex = this
    note.attachments.forEach(function (attachment) {
      var buffer = new Buffer(attachment, 'base64');
      var path = enex._exportAttachmentPath(exportDirectory, attachment)
      fs.writeFile(path, buffer, function (err) {
        if (err) throw err
      })
    })
  }
  
  this._resourceDirectory = function (exportDirectory) {
    return exportDirectory + '/resources'
  }
  
  this._exportAttachmentPath = function (exportDirectory, attachment) {
    return this._resourceDirectory(exportDirectory) + '/' + '095619d89dbbd6a0c5704d57e444f708' + '.' + 'png'
    //TODO: stub
  }

  this.each = function (cbEach, cbEnd) {
    var parser = new Parser(this, cbEach, cbEnd)
    fs.readFile(this.filename, 'utf8', function (error, file) {
      parser.write( file.toString() ).close()
    })
  }
}

exports.EvernoteExport = EvernoteExport