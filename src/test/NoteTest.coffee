TestConfig = require("./TestConfig")
Note = require('../lib/Note').Note
should = require 'should'
fs = require 'fs'
util = require 'util'

describe 'Note', ->
  describe 'without resources', ->
    note_enml = fs.readFileSync TestConfig.fixtures['note.enex']
    note = Note.parse note_enml
    describe '.parse()', ->
      it 'returns a note object.', ->
        note.should.be.an.instanceof(Note)
    
    describe '#filename(extension)', ->
      it 'escapes title string.', ->
        note.filename('.md').should.equal 'a single note fixture test  1.md'
        note.filename('.txt').should.equal 'a single note fixture test  1.txt'
    
    describe '@title', ->
      it 'is a title string.', ->
        note.title.should.equal 'a single note fixture/test: 1'
    
    describe '@created', ->
      it 'is a Date object.', ->
        date = TestConfig.fixtures['note.enex.created']
        note.created.should.be.an.instanceof Date
        note.created.should.eql date
    
    describe '@updated', ->
      it 'is a Date object.', ->
        date = TestConfig.fixtures['note.enex.updated']
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
    note_enml = fs.readFileSync TestConfig.fixtures['image.enex']
    note = Note.parse note_enml
    hash = TestConfig.fixtures['image.png.hash']
    content_expected = ' The first line.\n\n' +
      '![image/png][0]\n\n' +
      'The end line.\n\n\n\n' +
      '[0]: resources/' + hash + '/foo.png'
    describe '@content', ->
      it 'is ok.', ->
        note.content.should.equal content_expected
    describe '@attachments', ->
      it 'are loaded.', ->
        note.attachmentsLength.should.equal 1
        note.attachments[hash].data.length.should.equal 7551

  describe 'with two attachments', ->
    note_enml = fs.readFileSync TestConfig.fixtures['2_attachments.enex']
    note = Note.parse note_enml
    hash0 = TestConfig.fixtures['2_attachments.enex.hash0']
    hash1 = TestConfig.fixtures['2_attachments.enex.hash1']
    content_expected = ' [hello.txt][0]  \n' +
      '[world.txt][1] \n\n' +
      "[0]: resources/#{hash0}/hello.txt\n" +
      "[1]: resources/#{hash1}/world.txt"
    describe '@content', ->
      it 'is ok.', ->
        note.content.should.equal content_expected
    describe '@attachments', ->
      it 'are loaded.', ->
        note.attachmentsLength.should.equal 2
        note.attachments[hash0].fileName.should.equal 'hello.txt'
        note.attachments[hash1].fileName.should.equal 'world.txt'

  describe 'with multiple <en-media> tag for a single <resource>', ->
    note_enml = fs.readFileSync TestConfig.fixtures['file-name.enex']
    note = Note.parse note_enml
    describe '@attachments', ->
      it 'are loaded.', ->
        note.attachmentsLength.should.equal 1

  describe 'with <en-media></en-media> tag', ->
    note_enml = fs.readFileSync TestConfig.fixtures['en-media_end_tag.enex']
    note = Note.parse note_enml
    describe '@attachments', ->
      it 'are loaded.', ->
        note.attachmentsLength.should.equal 1
