TestConfig = require("./TestConfig")
Attachment = require('../lib/Attachment').Attachment
should = require 'should'
util = require 'util'
fs = require 'fs'
path = require 'path'

describe 'Attachment', () ->
  describe '#setFileName(fileName)', () ->
    it 'sets @fileName', () ->
      attachment = new Attachment
      attachment.setFileName 'a.b.c.jpg'
      attachment.fileName.should.equal 'a.b.c.jpg'
  describe '#exportFileName()', () ->
    it 'returns "{{hash}}/{{filename}}" with filename', () ->
      pngImage = fs.readFileSync TestConfig.fixtures['image.png']
      expectedFileName = "#{TestConfig.fixtures['image.png.hash']}/a.b.c.jpg"
      attachment = new Attachment
      attachment.setFileName 'a.b.c.jpg'
      attachment.loadData pngImage
      attachment.exportFileName().should.equal expectedFileName
    it 'returns "{{hash}}.{{extension}}" without filename', () ->
      pngImage = fs.readFileSync TestConfig.fixtures['ce332.png']
      attachment = new Attachment
      attachment.type = 'image/jpeg'
      attachment.setFileName ''
      attachment.loadData pngImage
      attachment.exportFileName().should.equal "#{path.basename(TestConfig.fixtures['ce332.png.hash'])}.jpeg"
