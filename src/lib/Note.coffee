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
    this.original_content = null # String
    this.attachments = {} # { 'MD5 hash' => Attachment object }
    this.attachmentsLength = 0

  filename: (extension) ->
    filename = this.title.replace /[\/:]/g, ' '
    extension = extension || '.md'
    filename + extension
  
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

  pushAttachment: (attachment) ->
    unless attachment.hash
      throw "hash is not set for attachment"
    @attachments[attachment.hash] = attachment
    @attachmentsLength += 1

  loadENMLContent: (note_content) ->
    # load a content string and convert it to Markdown string
    note = this
    @original_content = note_content
    note_content = note_content
      .replace(/<\?xml[^>]*>\s*/g, '')
      .replace(/<!(--)?\[CDATA[^>]*>\s*/g, '')
      .replace(/<!DOCTYPE[^>]*>\s*/g, '')
      .replace(/<en-note[^>]*>\s*/g, '')
      .replace(/<\/en-note>\s*/g, '')
      .replace(/]](--)?>\s*/g, '')
    $ = cheerio.load note_content
    $('en-media').each ->
      hash = $(this).attr('hash')
      type = $(this).attr('type')
      attachment = note.attachments[hash]
      attachmentFileName = attachment.exportFileName()
      displayAttachmentFileName = attachment.fileName || attachmentFileName
      if type.substr(0,5) == 'image'
        $(this).replaceWith("<img alt=\"#{type}\" src=\"resources/#{attachmentFileName}\"/>")
      else
        $(this).replaceWith("<a href=\"resources/#{attachmentFileName}\">#{displayAttachmentFileName}</a>")
    @content = html2markdown $.html()


Note.parse = (enml_note) -> # returns a Note object.
  $ = cheerio.load enml_note
  note = Note.composeNoteWithCheerio $('note')
  note

Note.composeNoteWithCheerio = ($note) -> # Cheerio object
  note = new Note
  note.title = $note.find('title').text()
  note.created = Note.parseENMLDate $note.find('created').text()
  note.updated = Note.parseENMLDate $note.find('updated').text()
  $note.find('tag').each ->
    note.tags.push this.text()
  $note.find('resource').each ->
    data = new Buffer this.find('data').text(), 'base64'
    attachment = new Attachment
    attachment.loadData data
    attachment.type = this.find('mime').text()
    attachment.setFileName this.find('file-name').text()
    note.pushAttachment attachment
  note.loadENMLContent $note.find('content').html()
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

exports.Note = Note
