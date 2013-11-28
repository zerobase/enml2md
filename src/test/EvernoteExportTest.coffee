TestConfig = require("./TestConfig")
EvernoteExport = require("../lib/EvernoteExport").EvernoteExport
should = require "should"
fs = require "fs"
util = require "util"
crypto = require "crypto"
mkdirp = require 'mkdirp'
temp = require "temp"
temp.track()

describe "EvernoteExport(enml_filename)", ->
  describe "#export(directory, cbDone)", ->
    it "creates an export directory", (done) ->
      temp.mkdir "enml2md", (err, dirPath) ->
        enex = new EvernoteExport TestConfig.fixtures['1_note.enex']
        enex.export dirPath, ->
          fs.stat dirPath, (err, stats) ->
            stats.isDirectory().should.be.true
            done err
    it "creates exported files", (done) ->
      temp.mkdir "enml2md", (err, dirPath) ->
        enex = new EvernoteExport TestConfig.fixtures['2_notes.enex']
        enex.export dirPath, ->
          fileName0 = dirPath + "/" + TestConfig.fixtures['2_notes.enex.fileName0']
          fileName1 = dirPath + "/" + TestConfig.fixtures['2_notes.enex.fileName1']
          fs.stat fileName0, (err, stats) ->
            stats.isFile().should.be.true
            fs.stat fileName1, (err, stats) ->
              stats.isFile().should.be.true
              done err
    it "creates an attachment direcotry", (done) ->
      temp.mkdir "enml2md", (err, dirPath) ->
        enex = new EvernoteExport TestConfig.fixtures['1_note.enex']
        enex.export dirPath, ->
          fs.stat dirPath + "/resources", (err, stats) ->
            stats.isDirectory().should.be.true
            done err
    it "creates attachment files", (done) ->
      temp.mkdir "enml2md", (err, dirPath) ->
        throw err if err
        enex = new EvernoteExport TestConfig.fixtures['image.enex']
        resourceDir = dirPath + "/resources"
        hash = TestConfig.fixtures['image.png.hash']
        filePath = resourceDir + "/#{hash}/foo.png"
        enex.export dirPath, ->
          fs.statSync(filePath).isFile().should.be.true
          fd = fs.createReadStream filePath
          md5 = crypto.createHash "md5"
          md5.setEncoding "hex"
          fd.on "end", ->
            md5.end()
            md5.read().should.equal hash
            done err
          fd.pipe md5
    it "creates attachment files without <file-name>", (done) ->
      temp.mkdir "enml2md", (err, dirPath) ->
        throw err if err
        enex = new EvernoteExport TestConfig.fixtures['file-name.enex']
        resourceDir = dirPath + "/resources"
        hash = TestConfig.fixtures['ce332.png.hash']
        filePath = "#{resourceDir}/#{hash}.png"
        enex.export dirPath, ->
          fs.existsSync(filePath).should.be.true
          done()
    it "can be called without a callback", (done) ->
      temp.mkdir "enml2md", (err, dirPath) ->
        enex = new EvernoteExport TestConfig.fixtures['1_note.enex']
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
      enex = new EvernoteExport TestConfig.fixtures['2_notes.enex']
      cbEach = (note) -> # callback for each note
        # do nothing
      cbEnd = -> # callback for the end
        enex.count.should.equal 2
        done()
      enex.each cbEach, cbEnd
    it "calls cbEach(note)", (done) ->
      enex = new EvernoteExport TestConfig.fixtures['1_note.enex']
      expected_created = TestConfig.fixtures['1_note.enex.created']
      expected_updated = TestConfig.fixtures['1_note.enex.updated']
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
      enex = new EvernoteExport TestConfig.fixtures['2_notes.enex']
      cbEnd = -> # callback for the end
        enex.count.should.equal 2
        done()
      enex.each null, cbEnd
    it "can be called without both beEach() and cbEnd()", (done) ->
      enex = new EvernoteExport TestConfig.fixtures['2_notes.enex']
      testDone = ->
        enex.count.should.equal 2 
        done()
      setTimeout testDone, 20
      enex.each null, null
