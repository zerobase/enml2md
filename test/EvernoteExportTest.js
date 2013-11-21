var EvernoteExport = require('../lib/EvernoteExport').EvernoteExport,
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
        var enex = new EvernoteExport('./test/fixtures/fixture1.enex')
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
        var enex = new EvernoteExport('./test/fixtures/fixture2.enex')
        enex.export(dirPath, function () {
          fs.stat(dirPath + '/Enml2md test fixture note 1.md', function (err, stats) {
            stats.isFile().should.be.true
            fs.stat(dirPath + '/Enml2md test fixture note 2.md', function (err, stats) {
              stats.isFile().should.be.true
              done(err)
            })
          })
        })
      })
    })
    it('creates an attachment direcotry', function(done) {
      temp.mkdir('enml2md', function(err, dirPath) {
        var enex = new EvernoteExport('./test/fixtures/fixture1.enex')
        enex.export(dirPath, function () {
          fs.stat(dirPath + '/resources', function (err, stats) {
            stats.isDirectory().should.be.true
            done(err)
          })
        })
      })
    })
    it('creates attachment files', function(done) {
      temp.mkdir('enml2md', function(err, dirPath) {
        if (err) throw err
        var enex = new EvernoteExport('./test/fixtures/fixture_image.enex')
        var resourceDir = dirPath + '/resources'
        var hash = '095619d89dbbd6a0c5704d57e444f708'
        var filePath = resourceDir + '/' + hash + '.png'
        enex.export(dirPath, function () {
          assertFileMD5Hash(done, err, filePath, hash)
        })
      })
    })
    it('can be called without a callback', function(done) {
      temp.mkdir('enml2md', function(err, dirPath) {
        var enex = new EvernoteExport('./test/fixtures/fixture1.enex')
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
      var enex = new EvernoteExport('./test/fixtures/fixture2.enex')
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
      var enex = new EvernoteExport('./test/fixtures/fixture1.enex')
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
      var enex = new EvernoteExport('./test/fixtures/fixture2.enex')
      var cbEnd = function () { // callback for the end
        enex.count.should.equal(2)
        done()
      }
      enex.each(null, cbEnd)
    })
    it('can be called without both beEach() and cbEnd()', function(done) {
      var enex = new EvernoteExport('./test/fixtures/fixture2.enex')
      var testDone = function () {
        enex.count.should.equal(2)
        done()
      }
      setTimeout(testDone, 20)
      enex.each(null, null)
    })
  })
})


// ============
// Test Helpers
// ============

function assertFileMD5Hash(done, err, filePath, hash) {
  var fd = fs.createReadStream(filePath)
  var md5 = crypto.createHash('md5')
  md5.setEncoding('hex')
  fd.on('end', function() {
    md5.end()
    md5.read().should.equal(hash)
    done(err)
  })
  fd.pipe(md5)
}