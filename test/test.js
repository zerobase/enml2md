var enml2md = require('../lib/enml2md.js'),
  should = require('should'),
  fs = require('fs')

describe('EvernoteExport', function() {
  describe('#notesCount()', function() {
    it('should return a count of notes in a ENML(.enex) file.', function(done) {
      testNotesCount('./test/fixtures/fixture2.enex', 2, done);
    });
  });
});

function testNotesCount(enml_filename, expect, done) {
  var enml = new enml2md.EvernoteExport(enml_filename);
  var count_async = enml.notesCount();
  count_async.on('done', function(count) {
    count.should.equal(expect);
    done();
  });
}

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
  it('#tags should be tags array.', function() {
    note.tags.should.be.an.instanceof(Array);
    note.tags.length.should.equal(2);
    note.tags[0].should.equal('markdown');
    note.tags[1].should.equal('evernote');
  });
});