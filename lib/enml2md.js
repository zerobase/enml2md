var EvernoteExport = function(filename) {
  
  var fs = require('fs')
  
  this.filename = filename
  this.count = 0

  var strict = true // sax.parser: set to false for html-mode
  
  this.export = function (exportDirectory, cbDone) {
    var mkdirp = require('mkdirp')
    var enex = this
    mkdirp(exportDirectory, function (err) {
      if (err) throw err
      enex.each(function (note) {
        enex._exportNote(exportDirectory, note)
      }, cbDone)
    })
  }
  
  this._exportNote = function (exportDirectory, note) {
    var path = exportDirectory + '/' + note.filename()
    fs.open(path, 'w', 0644, function (err, fd) {
      if (err) throw err
      fs.write(fd, note.toString())
    })
  }
  
  this.each = function (cbEach, cbEnd) {
    var parser = this._initParser(cbEach, cbEnd)
    fs.readFile(this.filename, 'utf8', function (error, file) {
      parser.write( file.toString() ).close()
    })
  }
  
  this._initParser = function (cbEach, cbEnd) {
    var sax = require("sax")
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
        cbEach(this.note)
      } else {
        // ignore
      }
    }
    parser.onend = function () {
      cbEnd()
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
  
  this.filename = function () {
    return this.title.replace('/', '_') + '.md'
  }
  
  this.toString = function () {
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
  var cheerio = require('cheerio')
  var $ = cheerio.load(enml_note)
  
  var note = new Note()
  
  note.title = $('title').text()
  note.created = Note.parseENMLDate( $('created').text() )
  note.updated = Note.parseENMLDate( $('updated').text() )
  $('tag').each(function(index) {
    note.tags[index] = $(this).text()
  })
  note.content = Note.parseENMLContent( $('content').html() )
  
  return note
}

Note.parseENMLDate = function (string) { // return a Date object.
  var year = parseInt( string.substr(0, 4) )
  var month = parseInt( string.substr(4, 2) )
  var day = parseInt( string.substr(6, 2) )
  var hours = parseInt( string.substr(9, 2) )
  var minutes = parseInt( string.substr(11, 2) )
  var seconds = parseInt( string.substr(13, 2) )
  return new Date(year, month, day, hours, minutes, seconds)
  // 20131102T100709Z
  // YYYYMMDDTHHMMSSZ
  // 012345678901234
  // string.substr(from [, length])
}

Note.parseENMLContent = function (note_content) { // return a string (Markdown format).
  var html2markdown = require('html2markdown')
  note_content = note_content
    .replace(/<\?xml[^>]*>\s*/g, '')
    .replace(/<!--\[CDATA[^>]*>\s*/g, '')
    .replace(/<!DOCTYPE[^>]*>\s*/g, '')
    .replace(/<en-note[^>]*>\s*/g, '')
    .replace(/<\/en-note>\s*/g, '')
    .replace(/]]-->\s*/g, '')
  return html2markdown(note_content)
}

module.exports.EvernoteExport = EvernoteExport
module.exports.Note = Note
