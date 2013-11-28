crypto = require "crypto"
mime = require 'mime'

class Attachment
  constructor: () ->
    @data = null # data string (base64)
    @hash = null # MD5 hash string
    @fileName = null # file basename string
    @type = null # MIME type string

  loadData: (data) ->
    @data = data
    @hash = this._hash(data)
  
  _hash: () ->
    md5 = crypto.createHash "md5"
    md5.setEncoding "hex"
    md5.write @data
    md5.end()
    md5.read()

  setFileName: (fileName) ->
    if fileName
      @fileName = fileName

  exportFileName: () ->
    if @fileName?
      @getHash() + '/' + @fileName
    else
      @getHash() + '.' + @getExtension()

  getHash: () ->
    throw "Data should be loaded before." unless @hash
    @hash

  getExtension: () ->
    if @fileName
      split = @fileName.split(".")
      split[split.length - 1]
    else
      mime.extension @type

  toString: () ->
    "fileName: #{@fileName}, @hash: #{@hash}, @extension: #{@extension}, @data.length: #{@data.length}"

exports.Attachment = Attachment
