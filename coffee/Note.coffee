cheerio = require 'cheerio'
html2markdown = require 'html2markdown'
Attachment = require('./Attachment').Attachment

class Note

  constructor: () ->
    this.title = null # String
    this.created = null # Date
    this.updated = null # Date
    this.tags = [] # Array of String
    this.content = null # String
    this.attachments = [] # Array of String(file data)
  
  filename: (extention) ->
    filename = this.title.replace /[\/:]/g, ' '
    extention = extention || '.md'
    filename + extention
  
  toString: () ->
    # attachments: not included.
    markdown = ''
    markdown += 'Title: ' + this.title + '\n'
    if this.tags.length > 0
      markdown += 'Tag:'
      this.tags.forEach (tag) ->
        markdown += ' ' + tag
      markdown += '\n'
    markdown += '\n'+ this.content
    markdown

Note.parse = (enml_note) -> # returns a Note object.
  $ = cheerio.load enml_note
  note = Note.withCheerio $
  note

Note.withCheerio = ($) -> # Cheerio object
  note = new Note
  note.title = $('title').text()
  note.created = Note.parseENMLDate $('created').text()
  note.updated = Note.parseENMLDate $('updated').text()
  $('tag').each (index) ->
    note.tags[index] = $(this).text()
  note.content = Note.parseENMLContent $('content').html()
  $('data').each (index) ->
    attachment = new Attachment
    attachment.data = $(this).text() # base64 string
    note.attachments[index] = attachment
  note

Note.parseENMLDate = (string) -> # return a Date object.
  year = parseInt string.substr(0, 4)
  month = parseInt string.substr(4, 2)
  day = parseInt string.substr(6, 2)
  hours = parseInt string.substr(9, 2)
  minutes = parseInt string.substr(11, 2)
  seconds = parseInt string.substr(13, 2)
  offset = new Date().getTimezoneOffset()
  new Date year, month - 1, day, hours, minutes-offset, seconds
  # 20131102T100709Z
  # YYYYMMDDTHHMMSSZ
  # 012345678901234
  # string.substr(from [, length])

Note.parseENMLContent = (note_content) -> # return a string (Markdown format).
  note_content = note_content
    .replace(/<\?xml[^>]*>\s*/g, '')
    .replace(/<!(--)?\[CDATA[^>]*>\s*/g, '')
    .replace(/<!DOCTYPE[^>]*>\s*/g, '')
    .replace(/<en-note[^>]*>\s*/g, '')
    .replace(/<\/en-note>\s*/g, '')
    .replace(/]](--)?>\s*/g, '')
    .replace(/<en-media type="image\/(png|jpg|gif)" hash="(\w+)"\/>/g, '<img alt="$1 image" src="resources/$2.$1"/>')
    .replace(/<en-media type="([^"]+)" hash="(\w+)"\/>/g, '<a href="resources/$2">atattchment: $2 ($1)</a>')
  # TODO: apropriate treatment of <en-media>
  html2markdown note_content

exports.Note = Note
