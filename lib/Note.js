var cheerio = require('cheerio'),
  html2markdown = require('html2markdown')

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

exports.Note = Note