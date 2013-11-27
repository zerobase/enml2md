TestConfig = require("./TestConfig")
Note = require('../lib/Note').Note
should = require 'should'
fs = require 'fs'
util = require 'util'

describe 'Note', ->
  describe 'without resources', ->
    note_enml = fs.readFileSync TestConfig.fixtures['note']
    note = Note.parse note_enml
    describe '.parse()', ->
      it 'returns a note object.', ->
        note.should.be.an.instanceof(Note)
    
    describe '#filename(extention)', ->
      it 'escapes title string.', ->
        note.filename('.md').should.equal 'a single note fixture test  1.md'
        note.filename('.txt').should.equal 'a single note fixture test  1.txt'
    
    describe '@title', ->
      it 'is a title string.', ->
        note.title.should.equal 'a single note fixture/test: 1'
    
    describe '@created', ->
      it 'is a Date object.', ->
        date = new Date 2013, 10, 2, 10, 7-TestConfig.TZOffsetMinutes, 9 # 20131102T100709Z
        note.created.should.be.an.instanceof Date
        note.created.should.eql date
    
    describe '@updated', ->
      it 'is a Date object.', ->
        date = new Date 2013, 10, 2, 10, 7-TestConfig.TZOffsetMinutes, 13  # 20131102T100713Z
        note.updated.should.be.an.instanceof Date
        note.updated.should.eql date
    
    describe '@tags', ->
      it 'is an array of string.', ->
        note.tags.should.be.an.instanceof Array
        note.tags.length.should.equal 2
        note.tags[0].should.equal 'markdown'
        note.tags[1].should.equal 'evernote'
    
    describe '@content', ->
      it 'is a Markdown string.', ->
        note.content.should.equal 'fixture content\n\n'

  describe 'with an image attachment', ->
    note_enml = fs.readFileSync TestConfig.fixtures['image']
    note = Note.parse note_enml
    hash = '095619d89dbbd6a0c5704d57e444f708'
    content_expected = ' The first line.\n\n' +
      '![png image][0]\n\n' +
      'The end line.\n\n\n\n' +
      '[0]: resources/' + hash + '/image.png'
    describe '@content', ->
      it 'is ok.', ->
        note.content.should.equal content_expected
    describe '@attachments', ->
      it 'are loaded.', ->
        note.attachmentsLength.should.equal 1
        note.attachments[hash].data.length.should.equal 7551

  describe 'with two attachments', ->
    note_enml = fs.readFileSync TestConfig.fixtures['3']
    note = Note.parse note_enml
    content_expected = ' [hello.txt][0]  \n' +
      '[world.txt][1] \n\n' +
      '[0]: resources/b1946ac92492d2347c6235b4d2611184/hello.txt\n' +
      '[1]: resources/591785b794601e212b260e25925636fd/world.txt'
    describe '@content', ->
      it 'is ok.', ->
        note.content.should.equal content_expected
    describe '@attachments', ->
      it 'are loaded.', ->
        note.attachmentsLength.should.equal 2
        note.attachments['b1946ac92492d2347c6235b4d2611184'].fileName.should.equal 'hello.txt'
        note.attachments['591785b794601e212b260e25925636fd'].fileName.should.equal 'world.txt'

  describe 'with multiple <en-media> tag for a single <resource>', ->
    note_enml = fs.readFileSync TestConfig.fixtures['4']
    note = Note.parse note_enml
    describe '@attachments', ->
      it 'are loaded.', ->
        note.attachmentsLength.should.equal 1
        
