var enml2md = require('../lib/enml2md.js'),
  should = require('should'),
  fs = require('fs')

describe('EvernoteExport(enml_filename)', function() {
  describe('#each(cbEach, cbEnd)', function() {
    it('should set total #count at cbEnd()', function(done) {
      var enex = new enml2md.EvernoteExport('./test/fixtures/fixture2.enex');
      enex.each(function (note) { // callback for each note
        // do nothing
      }, function () { // callback for the end
        enex.count.should.equal(2);
        done();
      });
    });
    it('should call cbEach(note)', function(done) {
      var enex = new enml2md.EvernoteExport('./test/fixtures/fixture1.enex');
      var expected_created = new Date(2013, 11, 2, 10, 0, 55); // 20131102T100055Z
      var expected_updated = new Date(2013, 11, 2, 10, 3, 49); // 20131102T100349Z
      enex.each(function (note) { // callback for each note
        note.title.should.equal('Enml2md test fixture note');
        note.created.should.eql(expected_created);
        note.updated.should.eql(expected_updated);
        note.tags.should.contain('markdown');
        note.tags.should.contain('evernote');
        note.tags.length.should.equal(2)
        note.content.should.equal('fixture content\n\n');
      }, function () { // callback for the end
        enex.count.should.equal(1);
        done();
      });
    });
  });
});

describe('Note', function() {
  var note_enml = fs.readFileSync('./test/fixtures/note.enex');
  var note = enml2md.Note.parse(note_enml);
  it('.parseNote() should return a note object.', function() {
    note.should.be.an.instanceof(enml2md.Note);
  });
  it('#title should be a title.', function() {
    note.title.should.equal('a single note fixture');
  });
  it('#created should be a date.', function() {
    var date = new Date(2013, 11, 2, 10, 7, 9); // 20131102T100709Z
    note.created.should.be.an.instanceof(Date);
    note.created.should.eql(date);
  });
  it('#updated should be a date.', function() {
    var date = new Date(2013, 11, 2, 10, 7, 13); // 20131102T100713Z
    note.updated.should.be.an.instanceof(Date);
    note.updated.should.eql(date);
  });
  it('#tags should be an array of string.', function() {
    note.tags.should.be.an.instanceof(Array);
    note.tags.length.should.equal(2);
    note.tags[0].should.equal('markdown');
    note.tags[1].should.equal('evernote');
  });
  it('#content should be a Markdown string.', function() {
    note.content.should.equal('fixture content\n\n');
  });
});