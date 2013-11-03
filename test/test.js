var enml2md = require('../lib/enml2md.js'),
  should = require('should'),
  fs = require('fs')

describe('EvernoteExport(enml_filename)', function() {
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
      var expected_created = new Date(2013, 11, 2, 10, 0, 55); // 20131102T100055Z
      var expected_updated = new Date(2013, 11, 2, 10, 3, 49); // 20131102T100349Z
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
  })
})

describe('Note', function() {
  var note_enml = fs.readFileSync('./test/fixtures/note.enex')
  var note = enml2md.Note.parse(note_enml)
  it('.parse() returns a note object.', function() {
    note.should.be.an.instanceof(enml2md.Note)
  })
  it('#title is a title string.', function() {
    note.title.should.equal('a single note fixture')
  })
  it('#created is a Date object.', function() {
    var date = new Date(2013, 11, 2, 10, 7, 9); // 20131102T100709Z
    note.created.should.be.an.instanceof(Date)
    note.created.should.eql(date)
  })
  it('#updated is a Date object.', function() {
    var date = new Date(2013, 11, 2, 10, 7, 13); // 20131102T100713Z
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