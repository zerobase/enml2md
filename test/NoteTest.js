(function() {
  var Note, TestConfig, fs, should, util;

  TestConfig = require("./TestConfig");

  Note = require('../lib/Note').Note;

  should = require('should');

  fs = require('fs');

  util = require('util');

  describe('Note', function() {
    describe('without resources', function() {
      var note, note_enml;
      note_enml = fs.readFileSync(TestConfig.fixtures['note']);
      note = Note.parse(note_enml);
      describe('.parse()', function() {
        return it('returns a note object.', function() {
          return note.should.be.an["instanceof"](Note);
        });
      });
      describe('#filename(extention)', function() {
        return it('escapes title string.', function() {
          note.filename('.md').should.equal('a single note fixture test  1.md');
          return note.filename('.txt').should.equal('a single note fixture test  1.txt');
        });
      });
      describe('@title', function() {
        return it('is a title string.', function() {
          return note.title.should.equal('a single note fixture/test: 1');
        });
      });
      describe('@created', function() {
        return it('is a Date object.', function() {
          var date;
          date = new Date(2013, 10, 2, 10, 7 - TestConfig.TZOffsetMinutes, 9);
          note.created.should.be.an["instanceof"](Date);
          return note.created.should.eql(date);
        });
      });
      describe('@updated', function() {
        return it('is a Date object.', function() {
          var date;
          date = new Date(2013, 10, 2, 10, 7 - TestConfig.TZOffsetMinutes, 13);
          note.updated.should.be.an["instanceof"](Date);
          return note.updated.should.eql(date);
        });
      });
      describe('@tags', function() {
        return it('is an array of string.', function() {
          note.tags.should.be.an["instanceof"](Array);
          note.tags.length.should.equal(2);
          note.tags[0].should.equal('markdown');
          return note.tags[1].should.equal('evernote');
        });
      });
      return describe('@content', function() {
        return it('is a Markdown string.', function() {
          return note.content.should.equal('fixture content\n\n');
        });
      });
    });
    describe('with an image attachment', function() {
      var content_expected, hash, note, note_enml;
      note_enml = fs.readFileSync(TestConfig.fixtures['image']);
      note = Note.parse(note_enml);
      hash = '095619d89dbbd6a0c5704d57e444f708';
      content_expected = ' The first line.\n\n' + '![png image][0]\n\n' + 'The end line.\n\n\n\n' + '[0]: resources/' + hash + '/foo.png';
      describe('@content', function() {
        return it('is ok.', function() {
          return note.content.should.equal(content_expected);
        });
      });
      return describe('@attachments', function() {
        return it('are loaded.', function() {
          note.attachmentsLength.should.equal(1);
          return note.attachments[hash].data.length.should.equal(7551);
        });
      });
    });
    describe('with two attachments', function() {
      var content_expected, note, note_enml;
      note_enml = fs.readFileSync(TestConfig.fixtures['3']);
      note = Note.parse(note_enml);
      content_expected = ' [hello.txt][0]  \n' + '[world.txt][1] \n\n' + '[0]: resources/b1946ac92492d2347c6235b4d2611184/hello.txt\n' + '[1]: resources/591785b794601e212b260e25925636fd/world.txt';
      describe('@content', function() {
        return it('is ok.', function() {
          return note.content.should.equal(content_expected);
        });
      });
      return describe('@attachments', function() {
        return it('are loaded.', function() {
          note.attachmentsLength.should.equal(2);
          note.attachments['b1946ac92492d2347c6235b4d2611184'].fileName.should.equal('hello.txt');
          return note.attachments['591785b794601e212b260e25925636fd'].fileName.should.equal('world.txt');
        });
      });
    });
    return describe('with multiple <en-media> tag for a single <resource>', function() {
      var note, note_enml;
      note_enml = fs.readFileSync(TestConfig.fixtures['4']);
      note = Note.parse(note_enml);
      return describe('@attachments', function() {
        return it('are loaded.', function() {
          return note.attachmentsLength.should.equal(1);
        });
      });
    });
  });

}).call(this);

/*
//@ sourceMappingURL=NoteTest.js.map
*/