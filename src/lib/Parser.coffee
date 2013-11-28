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
        note = Note.composeNoteWithCheerio $(this)
        parser.cbEach note if parser.cbEach
      parser.cbEnd() if parser.cbEnd

exports.Parser = Parser
