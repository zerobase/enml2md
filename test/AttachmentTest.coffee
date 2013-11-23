TestConfig = require("./TestConfig")
Attachment = require('../coffee/Attachment').Attachment
should = require 'should'
util = require 'util'

describe 'Attachment', () ->
  attachment = new Attachment
  describe '#setFileName(fileName)', () ->
    it 'sets @extentions', () ->
      attachment.setFileName 'a.b.c.jpg'
      attachment.fileName.should.equal 'a.b.c.jpg'
      attachment.extention.should.equal 'jpg'
