fs = require 'graceful-fs'
cheerio = require 'cheerio'
Note = require('./Note').Note
Attachment = require('./Attachment').Attachment

class Parser

  constructor: (@enex, @cbEach, @cbEnd) ->

  parse: (filename) ->
    parser = this
    fs.readFile filename, 'utf8', (error, fileContent) ->
      $ = cheerio.load fileContent
      $('note').each ->
        parser.enex.count += 1
        note = parser._composeNote $(this)
        parser.cbEach note if parser.cbEach
      parser.cbEnd() if parser.cbEnd

  _composeNote: ($note) ->
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
      attachment.setFileName this.find('file-name').text()
      note.pushAttachment attachment
    note.loadENMLContent $note.find('content').html()
    note

exports.Parser = Parser
