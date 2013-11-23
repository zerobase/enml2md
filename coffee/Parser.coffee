fs = require 'graceful-fs'
sax = require 'sax'
Note = require('./Note').Note
Attachment = require('./Attachment').Attachment

class Parser

  constructor: (enex, cbEach, cbEnd) ->

    strict = true # sax.parser: set to false for html-mode

    @saxParser = saxParser = sax.parser strict, {trim: false, normalize: false}
    
    @saxParser.ontextHandlers =

      'title': (text) ->
        saxParser.note.title = text

      'created': (text) ->
        saxParser.note.created = Note.parseENMLDate text

      'updated': (text) ->
        saxParser.note.updated = Note.parseENMLDate text

      'tag': (text) ->
        saxParser.note.tags.push text

      'data': (text) ->
        attachment = new Attachment
        attachment.loadData new Buffer text, 'base64'
        saxParser.note.pushAttachment attachment
        saxParser.currentAttachment = attachment

      'file-name': (fileName) ->
        saxParser.currentAttachment.setFileName fileName

    @saxParser.onopentag = (node) ->
      this.currentElement = node.name
      if node.name == 'note'
        this.note = new Note

    @saxParser.onclosetag = (nodeName) ->
      if nodeName == 'note'
        enex.count = enex.count + 1
        cbEach this.note if cbEach

    @saxParser.ontext = (text) ->
      handler = this.ontextHandlers[this.currentElement]
      if typeof handler == 'function'
        handler(text)

    @saxParser.oncdata = (text) ->
      this.cdata = text

    @saxParser.onclosecdata = () ->
      this.note.loadENMLContent this.cdata

    @saxParser.onend = () ->
      cbEnd() if cbEnd

  parse: (filename) ->
    saxParser = @saxParser
    fs.readFile filename, 'utf8', (error, file) ->
      saxParser.write( file.toString() ).close()

exports.Parser = Parser
