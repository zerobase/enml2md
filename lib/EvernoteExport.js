var sax = require("sax"),
  fs = require('graceful-fs'),
  mkdirp = require('mkdirp'),
  Note = require('./Note').Note

var EvernoteExport = function(filename) {
  
  this.filename = filename
  this.count = 0
  this.done = false

  var strict = true // sax.parser: set to false for html-mode
  
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
    var parser = this._initParser(cbEach, cbEnd)
    fs.readFile(this.filename, 'utf8', function (error, file) {
      parser.write( file.toString() ).close()
    })
  }
  
  this._initParser = function (cbEach, cbEnd) {
    var enex = this
    var parser = sax.parser(strict, {trim: false, normalize: false})
    
    parser.note_composers = {
      'title': function (text) {
        parser.note.title = text
      },
      'created': function (text) {
        parser.note.created = Note.parseENMLDate(text)
      },
      'updated': function (text) {
        parser.note.updated = Note.parseENMLDate(text)
      },
      'tag': function (text) {
        parser.note.tags.push(text)
      },
      'data': function (text) {
        parser.note.attachments.push(text) // base64 string
      }
    }
    parser.onopentag = function (node) {
      if (node.name == 'note') {
        this.note = new Note
      } else {
        this.current_element = node.name
      }
    }
    parser.ontext = function (text) {
      var note_composer = this.note_composers[this.current_element]
      if (typeof note_composer == 'function') {
        note_composer(text)
      }
    }
    parser.onopencdata = function () {
      this.cdata = ''
    }
    parser.oncdata = function (text) {
      this.cdata = text
    }
    parser.onclosecdata = function () {
      this.note.content = Note.parseENMLContent(this.cdata)
    }
    parser.onclosetag = function (nodeName) {
      if (nodeName == 'note') {
        enex.count = enex.count + 1
        if (cbEach) cbEach(this.note)
      } else {
        // ignore
      }
    }
    parser.onend = function () {
      if (cbEnd) cbEnd()
    }
    
    return parser
  }
}

exports.EvernoteExport = EvernoteExport