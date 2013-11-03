var cheerio = require('cheerio'),
  html2markdown = require('html2markdown'),
  sax = require("sax"),
  fs = require('fs')

var EvernoteExport = function(filename) {
  
  this.filename = filename
  this.count = 0
  
  this.each = function (cbEach, cbEnd) {
    var strict = true, // set to false for html-mode
      parser = sax.parser(strict, {trim: false, normalize: false}),
      obj = this
    
    parser.onopentag = function (node) {
      if (node.name == 'note') {
        this.note = new Note
        obj.count = obj.count + 1
      } else {
        this.current_element = node.name
      }
    }
    parser.ontext = function (text) {
      switch (this.current_element) {
        case 'title':
          this.note.title = text
          break
          
        case 'created':
          this.note.created = parseENMLDate(text)
          break
          
        case 'updated':
          this.note.updated = parseENMLDate(text)
          break
          
        case 'tag':
          this.note.tags.push(text)
          break
          
        default:
          // ignore
          break
      }
    }
    parser.onopencdata = function () {
      this.cdata = ''
    }
    parser.oncdata = function (text) {
      this.cdata = text
    }
    parser.onclosecdata = function () {
      this.note.content = parseENMLContent(this.cdata)
    }
    parser.onclosetag = function (nodeName) {
      if (nodeName == 'note') {
        cbEach(this.note)
      }
    }
    parser.onend = function () {
      cbEnd()
    }
    fs.readFile(this.filename, 'utf8', function (error, file) {
      parser.write( file.toString() ).close()
    })
  }
}

var Note = function () {
  this.title = null; // String
  this.created = null; // Date
  this.updated = null; // Date
  this.tags = []; // Array of String
  this.content = null; // String
}

Note.parse = function (enml_note) { // returns a Note object.
  var note = new Note()
  var $ = cheerio.load(enml_note)
  note.title = $('title').text()
  note.created = parseENMLDate( $('created').text() )
  note.updated = parseENMLDate( $('updated').text() )
  note.tags = []
  $('tag').each(function(index) {
    note.tags[index] = $(this).text()
  })
  note.content = parseENMLContent( $('content').html() )
  return note
}

function parseENMLDate(string) { // return a Date object.
  // 20131102T100709Z
  // YYYYMMDDTHHMMSSZ
  // 012345678901234
  // string.substr(from [, len])
  var year = parseInt( string.substr(0, 4) )
  var month = parseInt( string.substr(4, 2) )
  var day = parseInt( string.substr(6, 2) )
  var hours = parseInt( string.substr(9, 2) )
  var minutes = parseInt( string.substr(11, 2) )
  var seconds = parseInt( string.substr(13, 2) )
  var date = new Date(year, month, day, hours, minutes, seconds)
  return date
}

function parseENMLContent(note_content) { // return a string (Markdown format).
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
