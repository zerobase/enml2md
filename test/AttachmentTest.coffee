TestConfig = require("./TestConfig")
Attachment = require('../coffee/Attachment').Attachment
should = require 'should'
util = require 'util'
fs = require 'fs'

describe 'Attachment', () ->
  attachment = new Attachment
  describe '#setFileName(fileName)', () ->
    it 'sets @extentions', () ->
      attachment.setFileName 'a.b.c.jpg'
      attachment.fileName.should.equal 'a.b.c.jpg'
      attachment.extention.should.equal 'jpg'
  describe '#exportFileName()', () ->
    it 'returns "{{hash}}.{{extention}}" filename', () ->
      pngImage = fs.readFileSync TestConfig.fixtures['pngImage']
      attachment.setFileName 'a.b.c.jpg'
      attachment.loadData pngImage
      attachment.exportFileName().should.equal '095619d89dbbd6a0c5704d57e444f708/a.b.c.jpg'
