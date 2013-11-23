TestConfig = require("./TestConfig")
EvernoteExport = require("../coffee/EvernoteExport").EvernoteExport
should = require "should"
fs = require "fs"
util = require "util"
crypto = require "crypto"

describe "EvernoteExport(enml_filename)", ->
  temp = require "temp"
  temp.track()
  describe "#export(directory, cbDone)", ->
    it "creates an export directory", (done) ->
      temp.mkdir "enml2md", (err, dirPath) ->
        enex = new EvernoteExport TestConfig.fixtures['1']
        enex.export dirPath, ->
          fs.stat dirPath, (err, stats) ->
            stats.isDirectory().should.be.true
            done err
    it "creates exported files", (done) ->
      temp.mkdir "enml2md", (err, dirPath) ->
        enex = new EvernoteExport TestConfig.fixtures['2']
        enex.export dirPath, ->
          fs.stat dirPath + "/Enml2md test fixture note 1.md", (err, stats) ->
            stats.isFile().should.be.true
            fs.stat dirPath + "/Enml2md test fixture note 2.md", (err, stats) ->
              stats.isFile().should.be.true
              done err
    it "creates an attachment direcotry", (done) ->
      temp.mkdir "enml2md", (err, dirPath) ->
        enex = new EvernoteExport TestConfig.fixtures['1']
        enex.export dirPath, ->
          fs.stat dirPath + "/resources", (err, stats) ->
            stats.isDirectory().should.be.true
            done err
    it "creates attachment files", (done) ->
      temp.mkdir "enml2md", (err, dirPath) ->
        throw err if err
        enex = new EvernoteExport TestConfig.fixtures['image']
        resourceDir = dirPath + "/resources"
        hash = "095619d89dbbd6a0c5704d57e444f708"
        filePath = resourceDir + "/" + hash + ".png"
        enex.export dirPath, ->
          assertFileMD5Hash(done, err, filePath, hash)
    it "can be called without a callback", (done) ->
      temp.mkdir "enml2md", (err, dirPath) ->
        enex = new EvernoteExport TestConfig.fixtures['1']
        enex.export dirPath
        testDone = ->
          enex.count.should.equal 1
          if enex.done
            done()
          else
            setTimeout testDone, 10
        setTimeout testDone, 10
  
  describe "#each(cbEach, cbEnd)", ->
    it "sets total @count at cbEnd()", (done) ->
      enex = new EvernoteExport TestConfig.fixtures['2']
      cbEach = (note) -> # callback for each note
        # do nothing
      cbEnd = -> # callback for the end
        enex.count.should.equal 2
        done()
      enex.each cbEach, cbEnd
    it "calls cbEach(note)", (done) ->
      enex = new EvernoteExport TestConfig.fixtures['1']
      expected_created = new Date 2013, 10, 2, 10, 0-TestConfig.TZOffsetMinutes, 55 # 20131102T100055Z
      expected_updated = new Date 2013, 10, 2, 10, 3-TestConfig.TZOffsetMinutes, 49 # 20131102T100349Z
      cbEach = (note) -> # callback for each note
        note.title.should.equal "Enml2md test fixture note"
        note.created.should.eql expected_created
        note.updated.should.eql expected_updated
        note.tags.should.contain "markdown"
        note.tags.should.contain "evernote"
        note.tags.length.should.equal 2
        note.content.should.equal "fixture content\n\n"
      cbEnd = -> # callback for the end
        enex.count.should.equal 1
        done()
      enex.each cbEach, cbEnd
    it "can be called without cbEach()", (done) ->
      enex = new EvernoteExport TestConfig.fixtures['2']
      cbEnd = -> # callback for the end
        enex.count.should.equal 2
        done()
      enex.each null, cbEnd
    it "can be called without both beEach() and cbEnd()", (done) ->
      enex = new EvernoteExport TestConfig.fixtures['2']
      testDone = ->
        enex.count.should.equal 2 
        done()
      setTimeout testDone, 20
      enex.each null, null


# ============
# Test Helpers
# ============

assertFileMD5Hash = (done, err, filePath, hash) ->
  fd = fs.createReadStream filePath
  md5 = crypto.createHash "md5"
  md5.setEncoding "hex"
  fd.on "end", ->
    md5.end()
    md5.read().should.equal hash
    done err
  fd.pipe md5
