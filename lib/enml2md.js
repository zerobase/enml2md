var util = require('util'),
  sax = require("sax"),
  fs = require('graceful-fs'),
  mkdirp = require('mkdirp'),
  cheerio = require('cheerio'),
  html2markdown = require('html2markdown'),
  crypto = require('crypto')

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

var Note = function () {
  this.title = null // String
  this.created = null // Date
  this.updated = null // Date
  this.tags = [] // Array of String
  this.content = null // String
  this.attachments = [] // Array of String(file data)
  
  this.filename = function (extention) {
    var filename = this.title.replace(/[\/:]/g, ' ')
    extention = extention || '.md'
    return filename + extention
  }
  
  this.toString = function () {
    // attachments: not included.
    var markdown = ''
    markdown += 'Title: '+ this.title +'\n'
    if (this.tags.length > 0) {
      markdown += 'Tag:'
      this.tags.forEach(function(tag) {
        markdown += ' ' + tag
      })
      markdown += '\n'
    }
    markdown += '\n'+ this.content
    return markdown
  }
}

Note.parse = function (enml_note) { // returns a Note object.
  var $ = cheerio.load(enml_note)
  note = Note.withCheerio($)
  return note
}

Note.withCheerio = function ($) { // Cheerio object
  var note = new Note()
  
  note.title = $('title').text()
  note.created = Note.parseENMLDate( $('created').text() )
  note.updated = Note.parseENMLDate( $('updated').text() )
  $('tag').each(function(index) {
    note.tags[index] = $(this).text()
  })
  note.content = Note.parseENMLContent( $('content').html() )
  $('data').each(function(index) {
    note.attachments[index] = $(this).text() // base64 string
  })
  
  return note
}

Note.parseENMLDate = function (string) { // return a Date object.
  var year = parseInt( string.substr(0, 4) )
  var month = parseInt( string.substr(4, 2) )
  var day = parseInt( string.substr(6, 2) )
  var hours = parseInt( string.substr(9, 2) )
  var minutes = parseInt( string.substr(11, 2) )
  var seconds = parseInt( string.substr(13, 2) )
  var offset = new Date().getTimezoneOffset()
  return new Date(year, month - 1, day, hours, minutes-offset, seconds)
  // 20131102T100709Z
  // YYYYMMDDTHHMMSSZ
  // 012345678901234
  // string.substr(from [, length])
}

Note.parseENMLContent = function (note_content) { // return a string (Markdown format).
  note_content = note_content
    .replace(/<\?xml[^>]*>\s*/g, '')
    .replace(/<!(--)?\[CDATA[^>]*>\s*/g, '')
    .replace(/<!DOCTYPE[^>]*>\s*/g, '')
    .replace(/<en-note[^>]*>\s*/g, '')
    .replace(/<\/en-note>\s*/g, '')
    .replace(/]](--)?>\s*/g, '')
    .replace(/<en-media type="image\/(png|jpg|gif)" hash="(\w+)"\/>/g, '<img alt="$1 image" src="resources/$2.$1"/>')
    .replace(/<en-media type="([^"]+)" hash="(\w+)"\/>/g, '<a href="resources/$2">atattchment: $2 ($1)</a>')
  return html2markdown(note_content)
}

module.exports.EvernoteExport = EvernoteExport
module.exports.Note = Note
