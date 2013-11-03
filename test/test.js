var enml2md = require('../lib/enml2md.js'),
  should = require('should'),
  fs = require('fs'),
  util = require('util'),
  crypto = require('crypto')

var tzMin = (new Date).getTimezoneOffset() // minutes

describe('EvernoteExport(enml_filename)', function() {
  var temp = require('temp')
  temp.track()
  describe('#export(directory, cbDone)', function() {
    it('creates an export directory', function(done) {
      temp.mkdir('enml2md', function(err, dirPath) {
        var enex = new enml2md.EvernoteExport('./test/fixtures/fixture1.enex')
        enex.export(dirPath, function () {
          fs.stat(dirPath, function (err, stats) {
            stats.isDirectory().should.be.true
            done(err)
          })
        })
      })
    })
    it('creates exported files', function(done) {
      temp.mkdir('enml2md', function(err, dirPath) {
        var enex = new enml2md.EvernoteExport('./test/fixtures/fixture2.enex')
        enex.export(dirPath, function () {
          fs.readdir(dirPath, function (err, files) {
            files.length.should.equal(2)
            done(err)
          })
        })
      })
    })
    it('can be called without a callback', function(done) {
      temp.mkdir('enml2md', function(err, dirPath) {
        var enex = new enml2md.EvernoteExport('./test/fixtures/fixture1.enex')
        enex.export(dirPath)
        var testDone = function () {
          enex.count.should.equal(1)
          if (enex.done) done()
          else setTimeout(testDone, 10)
        }
        setTimeout(testDone, 10)
      })
    })
  })
  describe('#each(cbEach, cbEnd)', function() {
    it('sets total #count at cbEnd()', function(done) {
      var enex = new enml2md.EvernoteExport('./test/fixtures/fixture2.enex')
      var cbEach = function (note) { // callback for each note
        // do nothing
      }
      var cbEnd = function () { // callback for the end
        enex.count.should.equal(2)
        done()
      }
      enex.each(cbEach, cbEnd)
    })
    it('calls cbEach(note)', function(done) {
      var enex = new enml2md.EvernoteExport('./test/fixtures/fixture1.enex')
      var expected_created = new Date(2013, 10, 2, 10, 0-tzMin, 55) // 20131102T100055Z
      var expected_updated = new Date(2013, 10, 2, 10, 3-tzMin, 49) // 20131102T100349Z
      var cbEach = function (note) { // callback for each note
        note.title.should.equal('Enml2md test fixture note')
        note.created.should.eql(expected_created)
        note.updated.should.eql(expected_updated)
        note.tags.should.contain('markdown')
        note.tags.should.contain('evernote')
        note.tags.length.should.equal(2)
        note.content.should.equal('fixture content\n\n')
      }
      var cbEnd = function () { // callback for the end
        enex.count.should.equal(1)
        done()
      }
      enex.each(cbEach, cbEnd)
    })
    it('can be called without cbEach()', function(done) {
      var enex = new enml2md.EvernoteExport('./test/fixtures/fixture2.enex')
      var cbEnd = function () { // callback for the end
        enex.count.should.equal(2)
        done()
      }
      enex.each(null, cbEnd)
    })
    it('can be called without both beEach() and cbEnd()', function(done) {
      var enex = new enml2md.EvernoteExport('./test/fixtures/fixture2.enex')
      var testDone = function () {
        enex.count.should.equal(2)
        done()
      }
      setTimeout(testDone, 20)
      enex.each(null, null)
    })
  })
})

describe('Note', function() {
  describe('without resources', function () {
    var note_enml = fs.readFileSync('./test/fixtures/note.enex')
    var note = enml2md.Note.parse(note_enml)
    it('.parse() returns a note object.', function() {
      note.should.be.an.instanceof(enml2md.Note)
    })
    it('#filename(extention) escapes title string.', function() {
      note.filename('.md').should.equal('a single note fixture test  1.md')
      note.filename('.txt').should.equal('a single note fixture test  1.txt')
    })
    it('#title is a title string.', function() {
      note.title.should.equal('a single note fixture/test: 1')
    })
    it('#created is a Date object.', function() {
      var date = new Date(2013, 10, 2, 10, 7-tzMin, 9) // 20131102T100709Z
      note.created.should.be.an.instanceof(Date)
      note.created.should.eql(date)
    })
    it('#updated is a Date object.', function() {
      var date = new Date(2013, 10, 2, 10, 7-tzMin, 13) // 20131102T100713Z
      note.updated.should.be.an.instanceof(Date)
      note.updated.should.eql(date)
    })
    it('#tags is an array of string.', function() {
      note.tags.should.be.an.instanceof(Array)
      note.tags.length.should.equal(2)
      note.tags[0].should.equal('markdown')
      note.tags[1].should.equal('evernote')
    })
    it('#content is a Markdown string.', function() {
      note.content.should.equal('fixture content\n\n')
    })
  })
  describe('with image resources', function () {
    var note_enml = fs.readFileSync('./test/fixtures/fixture_image.enex')
    var note = enml2md.Note.parse(note_enml)
    var hash = '095619d89dbbd6a0c5704d57e444f708'
    var content_expected = ' The first line.\n\n'
      + '![png image][0]\n\n'
      + 'The end line.\n\n\n\n'
      + '[0]: resources/' + hash + '.png'
    it('#attachments are loaded.', function() {
      note.content.should.equal(content_expected)
      note.attachments.length.should.equal(1)
      note.attachments[0].length.should.equal(10193)
    })
  })
})