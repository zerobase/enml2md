TestConfig = require("./TestConfig")
Attachment = require('../lib/Attachment').Attachment
should = require 'should'
util = require 'util'
fs = require 'fs'

describe 'Attachment', () ->
  describe '#setFileName(fileName)', () ->
    it 'sets @fileName', () ->
      attachment = new Attachment
      attachment.setFileName 'a.b.c.jpg'
      attachment.fileName.should.equal 'a.b.c.jpg'
  describe '#exportFileName()', () ->
    it 'returns "{{hash}}/{{filename}}" with filename', () ->
      attachment = new Attachment
      pngImage = fs.readFileSync TestConfig.fixtures['pngImage']
      attachment.setFileName 'a.b.c.jpg'
      attachment.loadData pngImage
      attachment.exportFileName().should.equal '095619d89dbbd6a0c5704d57e444f708/a.b.c.jpg'
    it 'returns "{{hash}}.{{extension}}" without filename', () ->
      attachment = new Attachment
      pngImage = fs.readFileSync TestConfig.fixtures['ce332.png']
      attachment.type = 'image/jpeg'
      attachment.setFileName ''
      attachment.loadData pngImage
      attachment.exportFileName().should.equal 'ce33294de7e0db8c113933fcafffc3d2.jpeg'
