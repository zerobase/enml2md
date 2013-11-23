TestConfig = require("./TestConfig")
Note = require('../lib/Note').Note
should = require 'should'
fs = require 'fs'
util = require 'util'

describe 'Note', () ->
  describe 'without resources', () ->
    note_enml = fs.readFileSync TestConfig.fixtures['note']
    note = Note.parse note_enml
    it '.parse() returns a note object.', () ->
      note.should.be.an.instanceof(Note)
    
    it '#filename(extention) escapes title string.', () ->
      note.filename('.md').should.equal 'a single note fixture test  1.md'
      note.filename('.txt').should.equal 'a single note fixture test  1.txt'
    
    it '#title is a title string.', () ->
      note.title.should.equal 'a single note fixture/test: 1'
    
    it '#created is a Date object.', () ->
      date = new Date 2013, 10, 2, 10, 7-TestConfig.TZOffsetMinutes, 9 # 20131102T100709Z
      note.created.should.be.an.instanceof Date
      note.created.should.eql date
    
    it '#updated is a Date object.', () ->
      date = new Date 2013, 10, 2, 10, 7-TestConfig.TZOffsetMinutes, 13  # 20131102T100713Z
      note.updated.should.be.an.instanceof Date
      note.updated.should.eql date
    
    it '#tags is an array of string.', () ->
      note.tags.should.be.an.instanceof Array
      note.tags.length.should.equal 2
      note.tags[0].should.equal 'markdown'
      note.tags[1].should.equal 'evernote'
    
    it '#content is a Markdown string.', () ->
      note.content.should.equal 'fixture content\n\n'

  describe 'with image resources', () ->
    note_enml = fs.readFileSync TestConfig.fixtures['image']
    note = Note.parse note_enml
    hash = '095619d89dbbd6a0c5704d57e444f708'
    content_expected = ' The first line.\n\n' +
      '![png image][0]\n\n' +
      'The end line.\n\n\n\n' +
      '[0]: resources/' + hash + '.png'
    it '#attachments are loaded.', () ->
      note.content.should.equal content_expected
      note.attachments.length.should.equal 1
      note.attachments[0].data.length.should.equal 10193
